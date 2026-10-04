import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

const IconBase = ({ children, className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        {children}
    </svg>
);

const Pause = (props) => <IconBase {...props}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></IconBase>;
const RotateCcw = (props) => <IconBase {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></IconBase>;
const Volume2 = (props) => <IconBase {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></IconBase>;
const Copy = (props) => <IconBase {...props}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></IconBase>;
const Check = (props) => <IconBase {...props}><polyline points="20 6 9 17 4 12"/></IconBase>;
const PianoIcon = (props) => <IconBase {...props}><path d="M12 2H2v20h20V2Z"/><path d="M6 2v20"/><path d="M18 2v20"/><path d="M12 2v20"/><path d="M2 14h20"/></IconBase>;
const GridIcon = (props) => <IconBase {...props}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="3" y2="21"/><line x1="15" x2="15" y1="3" y2="21"/></IconBase>;
const Wand2 = (props) => <IconBase {...props}><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></IconBase>;
const Sliders = (props) => <IconBase {...props}><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/></IconBase>;
const Square = (props) => <IconBase {...props}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></IconBase>;

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const noteIndex = (n) => NOTES.indexOf(n);
const semitoneDist = (rootNote, otherNote) => ((noteIndex(otherNote) - noteIndex(rootNote)) % 12 + 12) % 12;
const noteAt = (rootNote, semis) => NOTES[(noteIndex(rootNote) + semis + 1200) % 12];

const SCALES = {
    major: { name: 'Major (Ionian)', intervals: [0, 2, 4, 5, 7, 9, 11] },
    minor: { name: 'Natural Minor', intervals: [0, 2, 3, 5, 7, 8, 10] },
    harmonic_minor: { name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11] },
    melodic_minor: { name: 'Melodic Minor', intervals: [0, 2, 3, 5, 7, 9, 11] },
    dorian: { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10] },
    phrygian: { name: 'Phrygian', intervals: [0, 1, 3, 5, 7, 8, 10] },
    lydian: { name: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11] },
    mixolydian: { name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10] },
    locrian: { name: 'Locrian', intervals: [0, 1, 3, 5, 6, 8, 10] },
    major_pentatonic: { name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9] },
    minor_pentatonic: { name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10] },
    blues: { name: 'Blues', intervals: [0, 3, 5, 6, 7, 10] },
    hirajoshi: { name: 'Hirajoshi (Jp)', intervals: [0, 2, 3, 7, 8] },
    flamenco: { name: 'Flamenco', intervals: [0, 1, 4, 5, 7, 8, 10] },
};

const COMPLEXITY = {
    power: { label: 'Power (5)', probability: { power: 1 } },
    triad: { label: 'Triads', probability: { triad: 0.8, sus: 0.2 } },
    seventh: { label: 'Sevenths (7)', probability: { triad: 0.3, seventh: 0.7 } },
    extended: { label: 'Extended (9/11/13)', probability: { seventh: 0.4, extended: 0.6 } },
    jazz: { label: 'Jazz / Complex', probability: { seventh: 0.2, extended: 0.5, altered: 0.3 } },
};

const ROMAN_MAP = { i: 0, ii: 1, iii: 2, iv: 3, v: 4, vi: 5, vii: 6 };
const ROMANS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const parseDegreeToken = (tok) => {
    const clean = tok.replace(/[^a-zA-Z]/g, '').toLowerCase();
    return ROMAN_MAP.hasOwnProperty(clean) ? ROMAN_MAP[clean] : 0;
};

const FUNCTION_GROUPS = { tonic: [0, 2, 5], subdominant: [1, 3], dominant: [4, 6] };
const FUNCTION_OF_DEGREE = {};
Object.entries(FUNCTION_GROUPS).forEach(([fn, degs]) => degs.forEach(d => FUNCTION_OF_DEGREE[d] = fn));
const TRANSITIONS = {
    tonic: { subdominant: 0.4, dominant: 0.35, tonic: 0.25 },
    subdominant: { dominant: 0.55, tonic: 0.25, subdominant: 0.2 },
    dominant: { tonic: 0.65, subdominant: 0.15, dominant: 0.2 },
};
const FN_COLOR = { tonic: '#ffb454', subdominant: '#4fd1c5', dominant: '#e6534d' };
const FN_LABEL = { tonic: 'T', subdominant: 'S', dominant: 'D' };

const weightedPick = (probMap) => {
    const entries = Object.entries(probMap);
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [key, w] of entries) {
        if (r < w) return key;
        r -= w;
    }
    return entries[0][0];
};

const getScaleNotesFull = (rootNote, scaleType) => {
    const rootIdx = NOTES.indexOf(rootNote);
    const intervals = SCALES[scaleType].intervals;
    const notes = [];
    for (let oct = 0; oct < 6; oct++) {
        intervals.forEach(int => notes.push(NOTES[(rootIdx + int) % 12]));
    }
    return notes;
};

const TRIAD_TABLE = {
    '4_7': { suffix: '', tag: 'maj' },
    '3_7': { suffix: 'm', tag: 'min' },
    '3_6': { suffix: 'dim', tag: 'dim' },
    '4_8': { suffix: 'aug', tag: 'aug' },
    '4_6': { suffix: '(b5)', tag: 'maj' },
    '3_8': { suffix: 'm(#5)', tag: 'min' },
};
const triadQuality = (rootNote, third, fifth) => {
    const i3 = semitoneDist(rootNote, third);
    const i5 = semitoneDist(rootNote, fifth);
    const key = i3 + '_' + i5;
    return TRIAD_TABLE[key] || { suffix: '', tag: 'maj' };
};

const seventhQuality = (rootNote, seventh, baseTag) => {
    const i7 = semitoneDist(rootNote, seventh);
    if (baseTag === 'maj') return i7 === 11 ? 'maj7' : i7 === 10 ? '7' : '7';
    if (baseTag === 'min') return i7 === 10 ? 'm7' : i7 === 11 ? 'm(maj7)' : 'm7';
    if (baseTag === 'dim') return i7 === 9 ? 'dim7' : i7 === 10 ? 'm7b5' : 'dim7';
    if (baseTag === 'aug') return i7 === 11 ? 'aug(maj7)' : 'aug7';
    return '7';
};

const buildChord = (scaleNotes, d, complexityKey) => {
    const family = weightedPick(COMPLEXITY[complexityKey].probability);
    const root = scaleNotes[d];

    if (family === 'power') {
        return { root, notes: [root, noteAt(root, 7)], suffix: '5', tag: 'power' };
    }
    if (family === 'sus') {
        const useSus4 = Math.random() < 0.5;
        const mid = useSus4 ? scaleNotes[d + 3] : scaleNotes[d + 1];
        return { root, notes: [root, mid, scaleNotes[d + 4]], suffix: useSus4 ? 'sus4' : 'sus2', tag: 'sus' };
    }

    const third = scaleNotes[d + 2];
    const fifth = scaleNotes[d + 4];
    const tq = triadQuality(root, third, fifth);

    if (family === 'triad') {
        return { root, notes: [root, third, fifth], suffix: tq.suffix, tag: tq.tag };
    }

    const seventh = scaleNotes[d + 6];
    const sevLabel = seventhQuality(root, seventh, tq.tag);

    if (family === 'seventh') {
        return { root, notes: [root, third, fifth, seventh], suffix: sevLabel, tag: tq.tag };
    }
    if (family === 'extended') {
        const notes = [root, third, fifth, seventh, scaleNotes[d + 8]];
        let ext = '9';
        if (Math.random() < 0.5) {
            if (Math.random() < 0.5) { notes.push(scaleNotes[d + 10]); ext = '11'; }
            else { notes.push(scaleNotes[d + 10], scaleNotes[d + 12]); ext = '13'; }
        }
        return { root, notes, suffix: sevLabel.replace('7', ext), tag: tq.tag };
    }
    const notes = [root, third, fifth, seventh, scaleNotes[d + 8]];
    const alterations = ['(b9)', '(#9)', '(#11)', '(b13)'];
    const alt = alterations[Math.floor(Math.random() * alterations.length)];
    return { root, notes, suffix: sevLabel + alt, tag: tq.tag };
};

const romanFor = (d, tag, scaleLen) => {
    if (scaleLen !== 7) return String(d + 1);
    const base = ROMANS[d % 7] || '?';
    const lower = (tag === 'min' || tag === 'dim') ? base.toLowerCase() : base;
    if (tag === 'dim') return lower + '°';
    if (tag === 'aug') return lower + '+';
    return lower;
};

const generateDegrees = (length, scaleLen, feel) => {
    const useFunctional = !(feel !== 'tight' || scaleLen !== 7);
    const degrees = [];
    const pickFromGroup = (fn) => {
        const pool = FUNCTION_GROUPS[fn];
        return pool[Math.floor(Math.random() * pool.length)];
    };
    for (let i = 0; i < length; i++) {
        let deg;
        if (useFunctional) {
            if (i === 0) {
                deg = Math.random() < 0.6 ? 0 : Math.floor(Math.random() * 7);
            } else if (i === length - 1) {
                if (Math.random() < 0.7) {
                    deg = 0;
                } else {
                    const prevFn = FUNCTION_OF_DEGREE[degrees[i - 1]];
                    deg = pickFromGroup(weightedPick(TRANSITIONS[prevFn]));
                }
            } else {
                const prevFn = FUNCTION_OF_DEGREE[degrees[i - 1]];
                deg = pickFromGroup(weightedPick(TRANSITIONS[prevFn]));
            }
        } else {
            deg = Math.floor(Math.random() * scaleLen);
        }
        let attempts = 0;
        while (!(degrees.length === 0 || deg !== degrees[degrees.length - 1] || attempts >= 5)) {
            deg = useFunctional ? pickFromGroup(FUNCTION_OF_DEGREE[deg] || 'tonic') : Math.floor(Math.random() * scaleLen);
            attempts++;
        }
        degrees.push(deg);
    }
    return degrees;
};

const RackLabel = ({ children }) => (
    <span className="mono text-[10px] uppercase tracking-[0.2em] text-[#7a7a7a] font-bold">{children}</span>
);

const RackSelect = ({ value, onChange, options, icon: Icon, label }) => (
    <div className="w-full">
        <div className="flex items-center gap-1.5 mb-2">
            {Icon ? <Icon className="h-3.5 w-3.5 text-[#7a7a7a]" /> : null}
            <RackLabel>{label}</RackLabel>
        </div>
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                className="mono w-full px-3 py-2.5 text-xs bg-[#141414] border border-[#2a2a2a] focus:border-[#ffb454] text-[#e8e6e1] transition-colors appearance-none hover:border-[#3a3a3a] rounded-none uppercase cursor-pointer"
            >
                {Object.entries(options).map(([key, val]) => (
                    <option key={key} value={key} className="bg-[#141414] text-[#e8e6e1]">{val.name || val.label}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <div className="w-1.5 h-1.5 border-r border-b border-[#7a7a7a] rotate-45 -mt-1" />
            </div>
        </div>
    </div>
);

const SegmentedControl = ({ value, onChange, options }) => (
    <div className="flex border border-[#2a2a2a] bg-[#141414]">
        {options.map(([key, text], i) => (
            <button
                key={key}
                onClick={() => onChange(key)}
                className={`mono flex-1 px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${i > 0 ? 'border-l border-[#2a2a2a]' : ''} ${value === key ? 'bg-[#ffb454] text-black' : 'text-[#7a7a7a] hover:text-[#e8e6e1] hover:bg-[#1c1c1c]'}`}
            >
                {text}
            </button>
        ))}
    </div>
);

const App = () => {
    const [root, setRoot] = useState('C');
    const [scaleKey, setScaleKey] = useState('minor');
    const [complexityKey, setComplexityKey] = useState('seventh');
    const [mode, setMode] = useState('random');
    const [feel, setFeel] = useState('tight');
    const [patternInput, setPatternInput] = useState('i VI III VII');
    const [progressionLength, setProgressionLength] = useState(4);
    const [chords, setChords] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeChordIndex, setActiveChordIndex] = useState(null);
    const [copied, setCopied] = useState(false);

    const audioCtxRef = useRef(null);
    const timeoutRefs = useRef([]);
    const scaleLen = SCALES[scaleKey].intervals.length;

    const initAudio = () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContext();
        }
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    };

    const getNoteFrequency = (note, octave) => {
        const baseFreq = 440;
        const distFromC = (NOTES.indexOf(note) - NOTES.indexOf('C') + 12) % 12;
        const midi = 12 * (octave + 1) + distFromC;
        return baseFreq * Math.pow(2, (midi - 69) / 12);
    };

    const playChordSound = useCallback((notes, duration = 1.2, delay = 0) => {
        initAudio();
        const ctx = audioCtxRef.current;
        const now = ctx.currentTime + delay;

        notes.forEach((note, index) => {
            let octave = index === 0 ? 3 : 4;
            if (index > 3) octave = 5;
            const freq = getNoteFrequency(note, octave);

            const noteGain = ctx.createGain();
            noteGain.connect(ctx.destination);
            noteGain.gain.setValueAtTime(0, now);
            noteGain.gain.linearRampToValueAtTime(1.0 / notes.length, now + 0.02);
            noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.6);

            // Warm electric piano body (Sine)
            const oscSine = ctx.createOscillator();
            oscSine.type = 'sine';
            oscSine.frequency.value = freq;
            oscSine.connect(noteGain);
            oscSine.start(now);
            oscSine.stop(now + duration * 1.6);

            // Lush electric piano timbre (Triangle)
            const oscTri = ctx.createOscillator();
            oscTri.type = 'triangle';
            oscTri.frequency.value = freq * 1.003;
            const triGain = ctx.createGain();
            triGain.gain.value = 0.4;
            oscTri.connect(triGain);
            triGain.connect(noteGain);
            oscTri.start(now);
            oscTri.stop(now + duration * 1.6);

            // Hammer transient
            const oscStrike = ctx.createOscillator();
            oscStrike.type = 'square';
            oscStrike.frequency.value = freq * 3.5;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(freq * 5, now);
            filter.frequency.exponentialRampToValueAtTime(freq, now + 0.08);
            const strikeGain = ctx.createGain();
            strikeGain.gain.setValueAtTime(0, now);
            strikeGain.gain.linearRampToValueAtTime(0.08, now + 0.004);
            strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
            oscStrike.connect(filter);
            filter.connect(strikeGain);
            strikeGain.connect(noteGain);
            oscStrike.start(now);
            oscStrike.stop(now + 0.1);
        });
    }, []);

    const stopPlaying = () => {
        timeoutRefs.current.forEach(clearTimeout);
        timeoutRefs.current = [];
        setIsPlaying(false);
        setActiveChordIndex(null);
    };

    const playProgression = () => {
        if (isPlaying) { stopPlaying(); return; }
        if (chords.length === 0) return;
        setIsPlaying(true);
        setActiveChordIndex(0);
        const step = 1.3;
        chords.forEach((chord, i) => {
            timeoutRefs.current.push(setTimeout(() => setActiveChordIndex(i), i * step * 1000));
            playChordSound(chord.notes, step, i * step);
        });
        timeoutRefs.current.push(setTimeout(() => {
            setIsPlaying(false);
            setActiveChordIndex(null);
        }, chords.length * step * 1000));
    };

    const generate = () => {
        stopPlaying();
        const scaleNotes = getScaleNotesFull(root, scaleKey);
        let degrees;
        if (mode === 'pattern') {
            const tokens = patternInput.trim().split(/[\s\-,]+/).filter(Boolean);
            degrees = tokens.length > 0 ? tokens.map(parseDegreeToken) : [0];
        } else {
            degrees = generateDegrees(progressionLength, scaleLen, feel);
        }

        const newChords = degrees.map((d) => {
            const built = buildChord(scaleNotes, d, complexityKey);
            return {
                name: built.root + built.suffix,
                roman: romanFor(d, built.tag, scaleLen),
                notes: built.notes,
                fn: scaleLen === 7 ? FUNCTION_OF_DEGREE[d % 7] : null,
                degree: d,
            };
        });
        setChords(newChords);
    };

    useEffect(() => { generate(); }, [root, scaleKey, mode, feel, progressionLength, patternInput, complexityKey]);

    const copyChords = () => {
        navigator.clipboard.writeText(chords.map(c => c.name).join(' - '));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const showsFunctionalNote = !(mode !== 'random' || feel !== 'tight' || scaleLen === 7);

    return (
        <div className="bg-[#0d0d0d] text-[#e8e6e1] overflow-x-hidden relative min-h-full pb-10">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 py-4 border-b border-[#2a2a2a] bg-gradient-to-b from-[#1a1a1a] to-[#141414]">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffb454]" style={{ boxShadow: '0 0 8px #ffb454' }} />
                    <h1 className="mono text-sm font-bold uppercase tracking-[0.3em] text-[#e8e6e1]">Chord Rack</h1>
                </div>
                <div className="flex items-center gap-2">
                    <span className="mono text-[10px] uppercase tracking-widest text-[#7a7a7a]">Key</span>
                    <span className="mono text-sm font-bold text-[#ffb454]">{root} {SCALES[scaleKey].name}</span>
                </div>
                <SegmentedControl value={mode} onChange={setMode} options={[['random', 'Random'], ['pattern', 'Pattern']]} />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-4 border-r border-[#2a2a2a] bg-[#111111] p-6 flex flex-col gap-6">
                    <div className="flex items-center gap-2 border-b border-[#2a2a2a] pb-2">
                        <Sliders className="w-3.5 h-3.5 text-[#7a7a7a]" />
                        <RackLabel>Rack</RackLabel>
                    </div>

                    <div>
                        <div className="flex items-center gap-1.5 mb-2">
                            <RackLabel>Base Key</RackLabel>
                        </div>
                        <div className="grid grid-cols-4 gap-px bg-[#2a2a2a] border border-[#2a2a2a]">
                            {NOTES.map(n => {
                                const isSharp = n.includes('#');
                                const active = root === n;
                                return (
                                    <button
                                        key={n}
                                        onClick={() => setRoot(n)}
                                        className={`mono h-10 flex items-center justify-center text-xs font-bold whitespace-nowrap transition-all ${active ? 'bg-[#ffb454] text-black' : isSharp ? 'bg-[#0d0d0d] text-[#7a7a7a] hover:text-[#e8e6e1]' : 'bg-[#1a1a1a] text-[#a8a8a8] hover:text-[#e8e6e1]'}`}
                                        style={{ whiteSpace: 'nowrap', fontSize: '12px', lineHeight: 1, letterSpacing: 'normal', padding: 0, margin: 0 }}
                                    >
                                        {n}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <RackSelect label="Scale Mode" value={scaleKey} onChange={(e) => setScaleKey(e.target.value)} options={SCALES} icon={PianoIcon} />

                    {mode === 'random' ? (
                        <>
                            <RackSelect label="Complexity" value={complexityKey} onChange={(e) => setComplexityKey(e.target.value)} options={COMPLEXITY} icon={Wand2} />

                            <div>
                                <div className="flex items-center gap-1.5 mb-2"><RackLabel>Feel</RackLabel></div>
                                <SegmentedControl value={feel} onChange={setFeel} options={[['tight', 'Tight'], ['loose', 'Loose']]} />
                                {showsFunctionalNote ? (
                                    <p className="mono text-[9px] text-[#7a7a7a] mt-2 leading-relaxed">
                                        For {SCALES[scaleKey].name}, gravity is relaxed since it's not a standard 7-degree scale.
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <div className="flex justify-between items-baseline mb-2">
                                    <RackLabel>Length</RackLabel>
                                    <span className="mono text-sm font-bold text-[#ffb454]">{progressionLength}</span>
                                </div>
                                <input type="range" min="2" max="8" value={progressionLength} onChange={(e) => setProgressionLength(+e.target.value)} className="w-full cursor-pointer" />
                                <div className="flex justify-between mono text-[9px] text-[#4a4a4a] mt-1 px-0.5">
                                    {[2, 3, 4, 5, 6, 7, 8].map(n => <span key={n}>{n}</span>)}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <GridIcon className="h-3.5 w-3.5 text-[#7a7a7a]" />
                                <RackLabel>Pattern</RackLabel>
                            </div>
                            <input
                                type="text"
                                value={patternInput}
                                onChange={(e) => setPatternInput(e.target.value)}
                                className="mono w-full px-3 py-2.5 bg-[#141414] border border-[#2a2a2a] focus:border-[#ffb454] text-[#e8e6e1] text-sm rounded-none uppercase outline-none"
                            />
                            <p className="mono text-[9px] text-[#7a7a7a] mt-2 leading-relaxed">Roman numerals I–VII separated by space or dash, e.g.: i-VI-III-VII</p>
                        </div>
                    )}

                    <div className="pt-4 border-t border-[#2a2a2a] flex flex-col gap-2">
                        <div className="flex gap-2 h-12">
                            <button onClick={generate} className="flex-grow bg-[#ffb454] text-black hover:bg-[#ffc474] font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 group">
                                <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                                <span>Generate</span>
                            </button>
                            <button onClick={playProgression} className={`w-14 flex items-center justify-center border border-[#2a2a2a] hover:border-[#ffb454] transition-all ${isPlaying ? 'bg-[#1c1c1c] text-[#ffb454]' : 'bg-[#141414] text-[#e8e6e1]'}`}>
                                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <span className="mono font-bold text-[10px]">Play</span>}
                            </button>
                        </div>
                        <button onClick={copyChords} className="mono text-[10px] uppercase tracking-widest text-[#7a7a7a] hover:text-[#e8e6e1] transition-colors flex items-center justify-center gap-1.5 py-1">
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? 'Copied' : 'Copy sequence'}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-8 bg-[#0d0d0d] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <RackLabel>Sequence</RackLabel>
                        {scaleLen === 7 ? (
                            <div className="flex items-center gap-3">
                                {['tonic', 'subdominant', 'dominant'].map(fn => (
                                    <div key={fn} className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: FN_COLOR[fn] }} />
                                        <span className="mono text-[9px] uppercase tracking-widest text-[#7a7a7a]">{FN_LABEL[fn]}</span>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {chords.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#2a2a2a] border border-[#2a2a2a]">
                            {chords.map((chord, i) => {
                                const active = activeChordIndex === i;
                                const fnColor = chord.fn ? FN_COLOR[chord.fn] : '#4a4a4a';
                                return (
                                    <div
                                        key={i}
                                        onClick={() => playChordSound(chord.notes)}
                                        className={`relative cursor-pointer p-5 flex flex-col justify-between aspect-[3/4] transition-all duration-150 ${active ? 'bg-[#1c1c1c]' : 'bg-[#111111] hover:bg-[#161616]'}`}
                                        style={active ? { boxShadow: `inset 0 0 0 1px ${fnColor}` } : {}}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="mono text-xs font-bold text-[#7a7a7a]">{chord.roman}</span>
                                            <div className="flex items-center gap-1.5">
                                                {active ? <Volume2 className="w-3.5 h-3.5" style={{ color: fnColor }} /> : null}
                                                {chord.fn ? <div className="w-1.5 h-1.5 rounded-full" style={{ background: fnColor, boxShadow: active ? `0 0 6px ${fnColor}` : 'none' }} /> : null}
                                            </div>
                                        </div>

                                        <div className="text-center my-3">
                                            <h3 className="mono text-3xl font-extrabold tracking-tight mb-1.5" style={{ color: active ? fnColor : '#e8e6e1' }}>{chord.name}</h3>
                                            <p className="mono text-[9px] tracking-widest uppercase text-[#5a5a5a]">{chord.notes.join(' ')}</p>
                                        </div>

                                        <div className="flex items-end justify-center gap-[3px] h-10">
                                            {chord.notes.map((n, idx) => {
                                                const h = 25 + (noteIndex(n) / 11) * 65;
                                                return <div key={idx} className="w-2 transition-all duration-300" style={{ height: `${h}%`, background: active ? fnColor : '#2f2f2f' }} />;
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-[#3a3a3a] h-96 border border-dashed border-[#2a2a2a]">
                            <Square className="w-12 h-12 mb-3 opacity-30" />
                            <p className="mono uppercase tracking-widest text-xs">No sequence data</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
