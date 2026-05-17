/**
 * Project showcase videos — local paths for development.
 * highside.mp4 (~150MB) exceeds GitHub's limit; host on YouTube/Cloudinary and set cdnUrl when ready.
 */
const PROJECT_VIDEOS = {
    defaultId: 'cleanroom',
    clips: [
        {
            id: 'cleanroom',
            title: 'Cleanroom MEP',
            subtitle: 'Controlled environment coordination',
            src: 'videos/cleanroom.mp4',
            thumb: 'image/hvac.jpg',
            tag: 'CLEANROOM',
        },
        {
            id: 'fire',
            title: 'Fire Safety Systems',
            subtitle: 'Sprinklers & life-safety layout',
            src: 'videos/fire.mp4',
            thumb: 'image/outdoor.jpg',
            tag: 'FIRE SAFETY',
        },
        {
            id: 'work',
            title: 'Site Execution',
            subtitle: 'Plumbing & drainage field work',
            src: 'videos/work.mp4',
            thumb: 'image/duct1.jpg',
            tag: 'PLUMBING / SITE',
            note: 'Large file (~47MB) — compress or use CDN for production',
        },
        {
            id: 'team',
            title: 'Team Coordination',
            subtitle: 'On-site MEP delivery',
            src: 'videos/team work.mp4',
            thumb: 'image/hvac2.jpg',
            tag: 'TEAM WORK',
        },
        {
            id: 'fire-exhaust',
            title: 'Fire Exhaust',
            subtitle: 'Exhaust & smoke management',
            src: 'videos/fire excaut.mp4',
            thumb: 'image/outdoor.jpg',
            tag: 'FIRE EXHAUST',
        },
        {
            id: 'highside',
            title: 'High Side HVAC',
            subtitle: 'Industrial HVAC execution',
            src: 'videos/highside.mp4',
            cdnUrl: '',
            thumb: 'image/hvac2.jpg',
            tag: 'HIGH SIDE HVAC',
            largeFile: true,
            note: '~150MB — do not push to GitHub; add cdnUrl when hosted externally',
        },
    ],
};

function getVideoSrc(clip) {
    if (clip.cdnUrl) return clip.cdnUrl;
    return clip.src;
}

function encodeVideoPath(path) {
    return path.split('/').map((part, i) => (i === 0 ? part : encodeURIComponent(part))).join('/');
}
