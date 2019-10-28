let canDrawProfile = false;
const alpha = 0.99;
const profile = new Image();
profile.onload = () => canDrawProfile = true;
profile.src = "https://akainth015.ga/images/text.2018.v5.png";

let particles = [];

navigator.mediaDevices.getUserMedia({audio: true}).then(mediaStream => {
    const audioContext = new AudioContext();
    const root = audioContext.createMediaStreamSource(mediaStream);
    const analyser = audioContext.createAnalyser();

    root.connect(analyser);

    const canvas = document.getElementById('pulse-root');
    const canvasContext = canvas.getContext('2d');

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);

    let frameCount = 0, smoothVolume = 0;

    function render() {
        requestAnimationFrame(render);
        const width = canvas.width = innerWidth;
        const height = canvas.height = innerHeight;
        canvasContext.clearRect(0, 0, width, height);

        analyser.getByteFrequencyData(frequencyData);

        smoothVolume = smoothVolume * alpha + Math.max(...frequencyData) * (1 - alpha);

        canvasContext.fillStyle = "black";
        particles.forEach((particle, index) => {
            const x = (frameCount - particle.emissionFrame) * particle.speed * Math.cos(particle.heading) + width / 2;
            const y = (frameCount - particle.emissionFrame) * particle.speed * Math.sin(particle.heading) + height / 2;

            canvasContext.beginPath();
            canvasContext.arc(x, y, 5, 0, Math.PI * 2);
            canvasContext.fill();
            canvasContext.closePath();

            if (x < 0 || x > width || y < 0 || y > height) {
                particles.splice(index, 1);
            }
        });

        const radius = Math.max(40, smoothVolume);

        for (let i = 0; i < frequencyData.length; i++) {
            canvasContext.fillStyle = "black";
            canvasContext.fillRect(width / 2 - radius - 32 - i, height / 2, 1, frequencyData[i]);
            canvasContext.fillRect(width / 2 + radius + 32 + i, height / 2, 1, frequencyData[i]);
            canvasContext.fillRect(width / 2 - radius - 32 - i, height / 2, 1, -frequencyData[i]);
            canvasContext.fillRect(width / 2 + radius + 32 + i, height / 2, 1, -frequencyData[i]);
        }

        canvasContext.fillStyle = "rgba(255, 255, 255, 0.8)";
        canvasContext.beginPath();
        const TAO = Math.PI * 2;
        canvasContext.arc(width / 2, height / 2, radius, 0, TAO);
        canvasContext.fill();
        canvasContext.closePath();

        for (let intensity = 0; intensity < 255; intensity++) {
            canvasContext.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
            canvasContext.beginPath();
            const intensityRadians = intensity * Math.PI / 180;
            canvasContext.arc(
                Math.cos(frameCount % TAO + smoothVolume / 10 - intensityRadians) * radius * 0.6 + width / 2,
                Math.sin(frameCount % TAO + smoothVolume / 10 - intensityRadians) * radius * 0.6 + height / 2,
                2, 0, TAO);
            canvasContext.fill();
            canvasContext.closePath();
        }

        for (let i = particles.length; i < smoothVolume; i++) {
            particles.push({
                emissionFrame: frameCount,
                heading: Math.random() * Math.PI * 2,
                speed: Math.max(6, smoothVolume / 10)
            });
        }

        frameCount += Math.max(0.1, smoothVolume / 250) / 4;
    }

    requestAnimationFrame(render);
});