import React, { useState, useEffect, useRef } from "react";
import MicRecorder from "mic-recorder-to-mp3";
import api from "../../api";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const VoiceRecorder = ({ type, onSaveAudio, existingAudio }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [blobURL, setBlobURL] = useState(null);
    const [isBlocked, setIsBlocked] = useState(false);
    const [timer, setTimer] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);
    const audioRef = useRef(null);

    useEffect(() => {
        const fetchAudio = async () => {
            if (!existingAudio) return;

            try {
                const response = await api.get(existingAudio, {
                    responseType: "blob",
                });
                const secureBlobURL = URL.createObjectURL(response.data);
                setBlobURL(secureBlobURL);
            } catch (err) {
                console.error("Error fetching audio:", err.message);
            }
        };

        fetchAudio();
    }, [existingAudio]);

    useEffect(() => {
        navigator.getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

        navigator.getUserMedia(
            { audio: true },
            () => setIsBlocked(false),
            () => setIsBlocked(true)
        );
    }, []);

    const startRecording = () => {
        if (isBlocked) {
            return;
        }
        Mp3Recorder.start()
            .then(() => {
                setIsRecording(true);
                startTimer();
            })
            .catch((e) => console.error(e));
    };

    const stopRecording = () => {
        Mp3Recorder.stop()
            .getMp3()
            .then(([buffer, blob]) => {
                const blobURL = URL.createObjectURL(blob);
                setBlobURL(blobURL);
                setIsRecording(false);
                stopTimer();
                onSaveAudio(blob);
            })
            .catch((e) => console.error(e));
    };

    const deleteRecording = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setBlobURL(null);
        setTimer(0);
        stopTimer();
        onSaveAudio(null);
    };

    const startTimer = () => {
        setTimer(0);
        const interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
        setTimerInterval(interval);
    };

    const stopTimer = () => {
        clearInterval(timerInterval);
        setTimerInterval(null);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    return (
        <div className="voice-recorder flex gap-4 items-center mt-4">
            {type !== "detail" && (
                <>
                    <button
                        type="button"
                        onClick={startRecording}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        disabled={isRecording}
                    >
                        Record
                    </button>
                    <button
                        type="button"
                        onClick={stopRecording}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        disabled={!isRecording}
                    >
                        Stop
                    </button>
                    <button
                        type="button"
                        onClick={deleteRecording}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        disabled={!blobURL}
                    >
                        Delete
                    </button>
                </>
            )}
            {isRecording && <p className="text-green-500 ml-4">Recording... {formatTime(timer)}</p>}
            {blobURL && <audio ref={audioRef} controls src={blobURL} className="ml-4 w-full" />}
        </div>
    );
};

export default VoiceRecorder;
