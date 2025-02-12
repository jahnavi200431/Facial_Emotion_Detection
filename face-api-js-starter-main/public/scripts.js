let runCount = 0;
const run = async () => {
   
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false, 
    });

    const videoFeedE1 = document.getElementById('video-feed');
    videoFeedE1.srcObject = stream;

    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.ageGenderNet.loadFromUri('./models'),
        faceapi.nets.faceExpressionNet.loadFromUri('./models'),
    ]);

    const canvas = document.getElementById('canvas');
    canvas.height = videoFeedE1.videoHeight;
    canvas.width = videoFeedE1.videoWidth;
    canvas.style.left = videoFeedE1.offsetLeft;
    canvas.style.top = videoFeedE1.offsetTop;

    const intervalId = setInterval(async () => {
        let faceAIData = await faceapi.detectAllFaces(videoFeedE1)
            .withFaceLandmarks()
            .withFaceDescriptors()
            .withAgeAndGender()
            .withFaceExpressions();

        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceAIData = faceapi.resizeResults(faceAIData, videoFeedE1);
        faceapi.draw.drawDetections(canvas, faceAIData);
        faceapi.draw.drawFaceLandmarks(canvas, faceAIData);
        faceapi.draw.drawFaceExpressions(canvas, faceAIData);

        const expressionsDiv = document.getElementById('expressions');
        expressionsDiv.innerHTML = ''; 

        faceAIData.forEach((face) => {
            const expressions = face.expressions;
            const maxExpression = Object.entries(expressions).reduce((max, current) => {
                return current[1] > max[1] ? current : max;
            }, ['', 0]);

            const expressionText = `${maxExpression[0]}: ${Math.round(maxExpression[1] * 100)}%`;
            
            const faceDiv = document.createElement('div');
            faceDiv.innerHTML = expressionText;
            expressionsDiv.appendChild(faceDiv);
            currentExpression = maxExpression[0];
        });

        console.log(faceAIData);

        runCount++;
        if (runCount >= 50) {
            clearInterval(intervalId);
            window.close();
        }
    }, 100);
    
}
const music = async () => {
    let audio;

    
    if (currentExpression === "sad") {
        audio = new Audio("path/to/sad-song.mp3");
    } else if (currentExpression === "happy") {
        audio = new Audio("path/to/happy-song.mp3");
    } else {
        audio = new Audio("path/to/neutral-song.mp3");
    }

    audio.play().catch(error => {
        console.error("Error playing audio:", error);
    });
}

run();
