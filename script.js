let currentSong = new Audio();
let songList;
let currFolder;

// const songsFolder = "songs";

// fetch(`/songs/`)
//     .then(response => response.text())
//     .then(data => {
//         const parser = new DOMParser();
//         const htmlDoc = parser.parseFromString(data, 'text/html');
//         const links = htmlDoc.querySelectorAll('a');
//         const fileNames = Array.from(links).map(link => {
//             const href = link.getAttribute('href');
//             const lastSlashIndex = href.lastIndexOf('/');
//             return href.substring(lastSlashIndex + 1); // Extract playlist name from URL
//         });
//         songsArray = fileNames.filter(fileName => !fileName.endsWith('/'));
//         console.log(songsArray);
//     })
//     .catch(error => console.error('Error fetching songs:', error));

let array = [];

async function createArr() {
    console.log("create song array");
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    array = Array.from(anchors)
        .filter(anchor => {
            return anchor.href.includes("/songs") && !anchor.href.includes(".htaccess");
        })
        .map(anchor => anchor.href.split("/").slice(-2)[0]);
    console.log(array);
}



function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();

    let div = document.createElement('div');
    div.innerHTML = response;


    let as = div.getElementsByTagName("a");
    songList = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith('.mp3'))
            songList.push(element.href.split(`/${folder}/`)[1]);
    }

    //Show all songs in that playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songList) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img src="img/music.svg" class = "invert" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>xyz</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img src="img/play.svg" class = "invert" alt="">
        </div>
        
    </li>`;
    }

    //Attach an Event Listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            //e.style.backgroundColor = "grey";
        })
    })



    return songList;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track

    track = decodeURI(track);
    // Remove playing class from previously playing songs
    const playingSongs = document.querySelectorAll('.songList li.playing');
    playingSongs.forEach(song => {
        song.classList.remove('playing');
    });

    // Add playing class to the current song
    const songElements = document.querySelectorAll('.songList li');
    songElements.forEach(songElement => {
        if (songElement.querySelector('.info div').textContent.trim() === track) {
            songElement.classList.add('playing');
        }
    });

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    console.log("displaying albums");
    let cardContainer = document.querySelector(".cardContainer")

    for (let index = 0; index < array.length; index++) {
        let folder = array[index];
        // Get the metadata of the folder
        let a = await fetch(`/songs/${folder}/info.json`)
        let response = await a.json();
        cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`

    }
}

// async function displayAlbums() {
//     console.log("displaying albums")
//     let a = await fetch(`/songs/`)
//     let response = await a.text();

//     let div = document.createElement("div")
//     div.innerHTML = response;

//     let x = div.getElementsByClassName("name")
//     let cardContainer = document.querySelector(".cardContainer")
//     let array = Array.from(x)

//     for (let index = 1; index < array.length; index++) {
//         const e = array[index];

//         let folder = e.innerHTML;
//         //Get the metadata of the folder
//         let a = await fetch(`/songs/${folder}/info.json`)
//         let response = await a.json();
//         cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
//             <img src="/songs/${folder}/cover.jpg" alt="">
//             <div class = cardText>
//                 <h3>${response.title}</h3>
//                 <p>${response.description}</p>
//             </div>
//         </div>`
//     }
// }




async function main() {
    // songs = await getSongs("songs/ncs");
    // playMusic(songs[0], true);

    //Display All the Albums
    await createArr();
    await displayAlbums();

    //Attach an Event Listener to play, next and previous
    play.addEventListener("click", element => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        let p = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = p + "%";

        document.querySelector(".seekbar .played").style.width = p + "%";
    });


    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;

    })

    //Add an event listener for Hamburger
    document.querySelector(".hamburger").addEventListener("click", (e) => {
        document.querySelector(".left").style.left = 0;
    })

    //Add an event listener for close
    document.querySelector(".close").addEventListener("click", (e) => {
        document.querySelector(".left").style.left = -130 + "%";
    })

    //Add an event listener for next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songList.indexOf(currentSong.src.split("/").slice(-1)[0])
        let len = songList.length;
        playMusic(songList[(index + 1) % len])

    })

    //Add an event listener for previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")

        let index = songList.indexOf(currentSong.src.split("/").slice(-1)[0])
        let len = songList.length;
        if (index == 0)
            playMusic(songList[len - 1]);
        else
            playMusic(songList[index - 1]);
    })

    //Add an event listener for volume button
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    //Add an event listener to mute
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("img/volume.svg")) {
            currentSong.volume = 0;
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            currentSong.volume = 0.10;
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            let folderName = item.currentTarget.dataset.folder;
            songList = await getSongs(`songs/${folderName}`)

            let a = await fetch(`/songs/${folderName}/info.json`)
            let response = await a.json();
            document.querySelector('#playlistName i').textContent = `${response.title}`;
        })
    })

    //Redirect on Login and SignUp
    document.querySelector(".signupbtn").addEventListener("click", () => {
        window.open("login.html", "_blank");
    })

    document.querySelector(".loginbtn").addEventListener("click", () => {
        window.open("login.html", "_blank");
    })

    //change Playlist on clicking the next button on navbar
    document.querySelector(".nextPlaylist").addEventListener("click", async () => {
        let n = array.length;
        let idx = 0;
        
        if (currFolder != undefined) {
            const folderName = currFolder.split("/").pop();
            idx = array.indexOf(folderName);
            idx = (idx + 1) % n;
        }

        await getSongs(`songs/${array[idx]}`);
        let a = await fetch(`/songs/${array[idx]}/info.json`);
        let response = await a.json();
        document.querySelector('#playlistName i').textContent = `${response.title}`;
    });


    //change Playlist on clicking the previous button on navbar
    document.querySelector(".prevPlaylist").addEventListener("click", async () => {
        let n = array.length;
        let idx = n-1;
        if (currFolder != undefined) {
            const folderName = currFolder.split("/").pop();
            idx = array.indexOf(folderName);
            if (idx == 0)
                idx = n - 1;
            else
                idx = idx - 1;
        }

        await getSongs(`songs/${array[idx]}`);
        let a = await fetch(`/songs/${array[idx]}/info.json`);
        let response = await a.json();
        document.querySelector('#playlistName i').textContent = `${response.title}`;
    });

    //add even listener to hide the header when hamburger is clicked (for mobile devices)
    hamburger.addEventListener("click", () => {
        document.querySelector(".header").style.zIndex = -1;
    })

    //add even listener to display the header when close button is clicked (for mobile devices)
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".header").style.zIndex = 1;
    })

    //add event listener to redirect about to GitHub repository
    document.querySelector(".about").addEventListener("click", () => {
        window.open("https://github.com/nv-0203/Mousiqiyy", "_blank");
    })
}

main();
