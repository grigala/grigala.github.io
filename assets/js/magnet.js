var client = new WebTorrent();

// HTML elements
var $body = document.body;
var $progressBar = document.querySelector('#progressBar');
var $numPeers = document.querySelector('#numPeers');
var $downloaded = document.querySelector('#downloaded');
var $total = document.querySelector('#total');
var $remaining = document.querySelector('#remaining');
var $uploadSpeed = document.querySelector('#uploadSpeed');
var $downloadSpeed = document.querySelector('#downloadSpeed');
var $streamedFileName = $('#streaming');

var announceList = [
    ['udp://tracker.openbittorrent.com:80'],
    ['udp://tracker.internetwarriors.net:1337'],
    ['udp://tracker.leechers-paradise.org:6969'],
    ['udp://tracker.coppersurfer.tk:6969'],
    ['udp://exodus.desync.com:6969'],
    ['wss://tracker.btorrent.xyz'],
    ['wss://tracker.openwebtorrent.com'],
    ['http://bt4.t-ru.org/ann?pk=4cf894bd2bb0c1faf3722b7a335aebd0'],
    ['http://retracker.local/announce'],
];

globalThis.WEBTORRENT_ANNOUNCE = announceList
    .map(function (arr) {
        return arr[0]
    })
    .filter(function (url) {
        return url.indexOf('wss://') === 0 || url.indexOf('ws://') === 0 || url.indexOf('http://') === 0
    });
client.on('error', function (err) {
    console.error('ERROR: ' + err.message)
});

onHashChange();
window.addEventListener('hashchange', onHashChange);

function onHashChange() {
    var hash = decodeURIComponent(window.location.hash.substring(1)).trim();
    if (hash !== '') streamTorrent(hash)
}

$('form').submit(function (e) {
    e.preventDefault();

    var torrentId = $('form input[name=torrentId]').val();

    if (torrentId.length > 0)
        streamTorrent(torrentId)
});

function streamTorrent(torrentId) {
    console.log(torrentId);
    client.add(torrentId, onTorrent)
}

function onTorrent(torrent) {
    torrent.on('warning', console.log);
    torrent.on('error', console.log);
    console.log('Got torrent metadata!');
    // Torrents can contain many files. Let's use the .mp4 file
    var file = torrent.files[0];
    for (var i = 1; i < torrent.files.length; i++) {
        if (torrent.files[i].length > file.length)
            file = torrent.files[i]
    }

    // Stream the file in the browser
    file.appendTo('#output');
    $streamedFileName.html(file.name);

    $('#magnet-input').slideUp();
    $('#hero').slideDown();
    // Trigger statistics refresh
    torrent.on('done', onDone);
    setInterval(onProgress, 500);
    onProgress();

    // Statistics
    function onProgress() {
        // Peers
        $numPeers.innerHTML = torrent.numPeers + (torrent.numPeers === 1 ? ' peer' : ' peers');

        // Progress
        var percent = Math.round(torrent.progress * 100 * 100) / 100;
        $progressBar.style.width = percent + '%';
        $downloaded.innerHTML = prettyBytes(torrent.downloaded);
        $total.innerHTML = prettyBytes(torrent.length);

        // Remaining time
        var remaining;
        if (torrent.done) {
            remaining = 'Done.'
        } else {
            remaining = moment.duration(torrent.timeRemaining / 1000, 'seconds').humanize();
            remaining = remaining[0].toUpperCase() + remaining.substring(1) + ' remaining.'
        }
        $remaining.innerHTML = remaining;

        // Speed rates
        $downloadSpeed.innerHTML = prettyBytes(torrent.downloadSpeed) + '/s';
        $uploadSpeed.innerHTML = prettyBytes(torrent.uploadSpeed) + '/s'
    }

    function onDone() {
        $body.className += ' is-seed';
        onProgress()
    }
}

// Human readable bytes util
function prettyBytes(num) {
    var exponent, unit, neg = num < 0, units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    if (neg) num = -num;
    if (num < 1) return (neg ? '-' : '') + num + ' B';
    exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
    num = Number((num / Math.pow(1000, exponent)).toFixed(2));
    unit = units[exponent];
    return (neg ? '-' : '') + num + ' ' + unit
}

