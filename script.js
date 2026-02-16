// Animate skill bars when they come into view
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.bar');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.5
    });
    
    skillBars.forEach(bar => {
        observer.observe(bar);
    });
}

// Animate circular progress with counting effect
function animateCircularProgress() {
    const circles = document.querySelectorAll('.outer-circle');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                
                const percentText = entry.target.querySelector('.inner-circle');
                const targetPercent = parseInt(percentText.textContent);
                let currentPercent = 0;
                
                const interval = setInterval(() => {
                    if (currentPercent < targetPercent) {
                        currentPercent++;
                        percentText.textContent = currentPercent + '%';
                    } else {
                        clearInterval(interval);
                    }
                }, 20);
            }
        });
    }, {
        threshold: 0.5
    });
    
    circles.forEach(circle => {
        observer.observe(circle);
    });
}

// Add pulse effect to skill icons on hover
function addIconEffects() {
    const icons = document.querySelectorAll('.info i');
    
    icons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.3) rotate(10deg)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });
}

// Initialize all animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    animateSkillBars();
    animateCircularProgress();
    addIconEffects();
    
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Optional: Add parallax effect on scroll
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const containers = document.querySelectorAll('.skills-container');
    
    containers.forEach((container, index) => {
        const speed = (index + 1) * 0.1;
        container.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

