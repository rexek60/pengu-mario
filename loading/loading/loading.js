function startLoadingSequence() {
    const container = document.getElementById("loading-screen");

    container.innerHTML = `
        <img id="pengu-anim" src="loading/loading_pengu.gif" />
        <div id="loading-bar"><div id="loading-fill"></div></div>
    `;

    let progress = 0;

    const interval = setInterval(() => {
        progress += 2;
        document.getElementById("loading-fill").style.width = progress + "%";

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                window.location.href = "tips/tips.html";
            }, 300);
        }
    }, 50);
}
