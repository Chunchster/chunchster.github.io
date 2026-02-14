// ============================================
// SLIDE NAVIGATION SYSTEM
// ============================================

const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.nav-dot');
const totalSlidesEl = document.getElementById('total-slides');
const currentSlideEl = document.getElementById('current-slide');
const swipeHint = document.getElementById('swipe-hint');

let currentSlide = 0;
let isAnimating = false;
const TOTAL_SLIDES = slides.length;

if (totalSlidesEl) totalSlidesEl.textContent = TOTAL_SLIDES;

function goToSlide(index, direction = 'right') {
    if (isAnimating || index === currentSlide || index < 0 || index >= TOTAL_SLIDES) return;
    isAnimating = true;

    const oldSlide = slides[currentSlide];
    const newSlide = slides[index];

    // Remove all transition classes
    slides.forEach(s => {
        s.classList.remove('active', 'exit-left', 'exit-right', 'enter-left');
    });

    // Set direction
    if (direction === 'right') {
        oldSlide.classList.add('exit-left');
        newSlide.style.transform = 'translateX(100%)';
    } else {
        oldSlide.classList.add('exit-right');
        newSlide.style.transform = 'translateX(-100%)';
        newSlide.classList.add('enter-left');
    }

    // Force reflow
    void newSlide.offsetWidth;

    // Remove inline transform and add active
    newSlide.style.transform = '';
    newSlide.classList.remove('enter-left');
    newSlide.classList.add('active');

    // Update dots
    dots.forEach(d => d.classList.remove('active'));
    if (dots[index]) dots[index].classList.add('active');

    // Update counter
    if (currentSlideEl) currentSlideEl.textContent = index + 1;

    const prevSlide = currentSlide;
    currentSlide = index;

    // Hide swipe hint after first swipe
    if (swipeHint && prevSlide === 0) {
        swipeHint.style.display = 'none';
    }

    // Trigger slide-specific animations
    onSlideEnter(index);

    setTimeout(() => {
        isAnimating = false;
    }, 650);
}

function nextSlide() {
    if (currentSlide < TOTAL_SLIDES - 1) {
        goToSlide(currentSlide + 1, 'right');
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        goToSlide(currentSlide - 1, 'left');
    }
}

// ============================================
// TOUCH / SWIPE HANDLING
// ============================================

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const MIN_SWIPE = 50;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;

    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Only swipe if horizontal movement is greater than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > MIN_SWIPE) {
        if (diffX > 0) {
            nextSlide(); // Swipe left → next
        } else {
            prevSlide(); // Swipe right → prev
        }
    }
}, { passive: true });

// ============================================
// KEYBOARD NAVIGATION
// ============================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prevSlide();
    }
});

// ============================================
// MOUSE WHEEL NAVIGATION
// ============================================

let wheelTimeout = false;

document.addEventListener('wheel', (e) => {
    if (wheelTimeout) return;
    wheelTimeout = true;

    if (e.deltaY > 30) {
        nextSlide();
    } else if (e.deltaY < -30) {
        prevSlide();
    }

    setTimeout(() => { wheelTimeout = false; }, 800);
}, { passive: true });

// ============================================
// DOT CLICK NAVIGATION
// ============================================

dots.forEach(dot => {
    dot.addEventListener('click', () => {
        const target = parseInt(dot.dataset.slide);
        const direction = target > currentSlide ? 'right' : 'left';
        goToSlide(target, direction);
    });
});

// ============================================
// COUNTDOWN TIMERS
// ============================================

const FECHA_ENERO = new Date(2025, 0, 2, 17, 0, 0);
const FECHA_OCTUBRE = new Date(2025, 9, 11, 19, 0, 0);

function updateCountdown(startDate, prefix) {
    const now = new Date();
    const diff = now - startDate;
    if (diff < 0) return;

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const el = (id) => document.getElementById(id);
    const set = (id, val) => { const e = el(id); if (e) e.textContent = val; };

    set(`${prefix}-dias`, days.toLocaleString());
    set(`${prefix}-horas`, String(hours).padStart(2, '0'));
    set(`${prefix}-minutos`, String(minutes).padStart(2, '0'));
    set(`${prefix}-segundos`, String(seconds).padStart(2, '0'));
}

function updateAllCountdowns() {
    updateCountdown(FECHA_ENERO, 'enero');
    updateCountdown(FECHA_OCTUBRE, 'octubre');
}

updateAllCountdowns();
setInterval(updateAllCountdowns, 1000);

// ============================================
// PETAL / PARTICLE CANVAS
// ============================================

const canvas = document.getElementById('petals-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let petals = [];

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Petal {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * (canvas ? canvas.width : 400);
        this.y = -20 - Math.random() * 100;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 1.2 + 0.3;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.color = this.getColor();
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.02 + 0.01;
    }

    getColor() {
        const colors = [
            'rgba(233, 30, 99,',   // Pink
            'rgba(244, 143, 177,', // Light pink
            'rgba(255, 96, 144,',  // Rose
            'rgba(255, 128, 171,', // Soft pink
            'rgba(255, 215, 0,',   // Gold (rare)
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.wobble += this.wobbleSpeed;
        this.x += this.speedX + Math.sin(this.wobble) * 0.5;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.y > (canvas ? canvas.height : 800) + 20) {
            this.reset();
        }
    }

    draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;

        // Draw heart-shaped petal
        ctx.beginPath();
        const s = this.size;
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.1, 0, s);
        ctx.bezierCurveTo(s, s * 0.1, s * 0.5, -s * 0.3, 0, s * 0.3);
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.fill();

        ctx.restore();
    }
}

function initPetals() {
    if (!canvas) return;
    resizeCanvas();

    const count = window.innerWidth < 500 ? 15 : 25;
    petals = [];
    for (let i = 0; i < count; i++) {
        const p = new Petal();
        p.y = Math.random() * canvas.height; // Spread initially
        petals.push(p);
    }
}

function animatePetals() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    petals.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animatePetals);
}

window.addEventListener('resize', resizeCanvas);
initPetals();
animatePetals();

// ============================================
// SLIDE-SPECIFIC ENTER ANIMATIONS
// ============================================

function onSlideEnter(index) {
    switch (index) {
        case 1: animateTimeline(); break;
        case 4: animateLetterLines(); break;
    }
}

// Timeline animation
function animateTimeline() {
    const items = document.querySelectorAll('.timeline-item');
    items.forEach((item, i) => {
        item.classList.remove('visible');
        setTimeout(() => {
            item.classList.add('visible');
        }, 200 + i * 300);
    });
}

// Letter lines animation (typewriter-like reveal)
let letterAnimated = false;
function animateLetterLines() {
    if (letterAnimated) return;
    letterAnimated = true;

    const lines = document.querySelectorAll('.letter-line');
    const signature = document.querySelector('.letter-signature');

    lines.forEach((line, i) => {
        setTimeout(() => {
            line.classList.add('visible');
        }, 300 + i * 400);
    });

    // Show signature after all lines
    if (signature) {
        setTimeout(() => {
            signature.classList.add('visible');
        }, 300 + lines.length * 400 + 300);
    }
}

// ============================================
// SURPRISE INTERACTION
// ============================================

const surpriseHeart = document.getElementById('surprise-heart');
const surpriseMessage = document.getElementById('surprise-message');

if (surpriseHeart && surpriseMessage) {
    surpriseHeart.addEventListener('click', () => {
        surpriseHeart.classList.add('hidden');
        surpriseMessage.classList.add('visible');
        launchConfetti();
    });
}

// ============================================
// CONFETTI EXPLOSION
// ============================================

function launchConfetti() {
    const container = document.createElement('div');
    container.classList.add('confetti-container');
    document.body.appendChild(container);

    const emojis = ['❤️', '💕', '💖', '💗', '✨', '🥰', '💘', '💝', '🌹', '💐'];
    const count = 60;

    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('span');
        confetti.classList.add('confetti');
        confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.fontSize = (Math.random() * 16 + 10) + 'px';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confetti.style.animationDelay = (Math.random() * 1.5) + 's';
        container.appendChild(confetti);
    }

    // Clean up
    setTimeout(() => container.remove(), 5000);
}

// ============================================
// INITIAL SETUP
// ============================================

// Make first slide active on load
slides[0].classList.add('active');

// Trigger timeline animation if starting on slide 1
if (currentSlide === 1) animateTimeline();
