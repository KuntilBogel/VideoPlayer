const subsrt = (await import('subsrt')).default;
function deleteLocalStorageWithSuffix(suffix) {
    for (let i = localStorage.length - 1; i >= 0; i--) { // Iterate in reverse
        const key = localStorage.key(i);
        if (key.endsWith(suffix)) {
            localStorage.removeItem(key);
        }
    }
}

async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

function conv(input) {
    return subsrt.convert(input, { format: "vtt" })
}

// document.querySelector("#main_vid_dl").href = params.get("videolink")
const params = new URLSearchParams(window.location.search)
let subtitle = params.get("subtitlelink"),
    main_sub = document.querySelector("#main_sub"),
    vid_link = params.get("videolink"),
    backup_vidlink = document.querySelector("#main_vid").src,
    started = false
if (vid_link) {
    document.querySelector("#main_vid").src = vid_link;
    fetch(vid_link, { method: 'HEAD' }).then(response => {
        if (!response.ok) throw new Error(response.status);
    }).catch(e => {
        JSAlert.alert(e + "\nWhile loading video", null, JSAlert.Icons.Failed);
        document.querySelector("#main_vid").src = backup_vidlink
    })
}

let vidhash = (await sha256(vid_link)).slice(0, 10)
if (subtitle) {
    fetch(subtitle).then(async p => {
        const resp = await p.text()
        document.querySelector("#main_sub").src = URL.createObjectURL(new Blob([conv(resp)], { type: 'text/vtt' }));
    }).catch(e => {
        JSAlert.alert(e + "\nWhile loading subtitle", null, JSAlert.Icons.Failed);
    })
} else {
    main_sub.remove()
}

const player = new Plyr('#player');

if (document.readyState !== 'loading') {
    myInitCode();
} else {
    document.addEventListener('DOMContentLoaded', function () {
        myInitCode();
    });
}

function myInitCode() {
    window.player = player;

    // Bind event listener
    function on(selector, type, callback) {
        document.querySelector(selector).addEventListener(type, callback, false);
    }

    // Play
    on('.js-play', 'click', () => {
        player.play();
    });

    // Pause
    on('.js-pause', 'click', () => {
        player.pause();
    });

    // Stop
    on('.js-stop', 'click', () => {
        player.stop();
    });

    //Delete playback
    on('.js-delplayback', 'click', () => {
        JSAlert.alert("Successfully deleted all playback", null, JSAlert.Icons.Deleted)
        deleteLocalStorageWithSuffix('saved-time');
    });

    // Rewind
    on('.js-rewind', 'click', () => {
        player.rewind();
    });

    // Forward
    on('.js-forward', 'click', () => {
        player.forward();
    });
}

player.on('playing', (event) => {
    const storedTime = localStorage.getItem(vidhash + '-saved-time');
    if (storedTime && (storedTime > 1) && storedTime != player.currentTime) {
        if(!started) {
            started = true
            player.currentTime = Number(storedTime);
        }
    }
})

player.on('ended', () => {
    localStorage.removeItem(vidhash + '-saved-time');
});

player.on('timeupdate', (event) => {
    if (player.currentTime != 0) {
        localStorage.setItem(vidhash + '-saved-time', player.currentTime);
    }
})