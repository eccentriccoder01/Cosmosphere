// Global variables
let currentEra = 'early';
let isAnimating = false;
let missionData = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    setupTimelineControls();
    setupMissionSimulator();
    setupTooltips();
    setupProgressAnimations();
    setupFutureCards();
    setupScrollEffects();
    animateCounters();
    initializeCharts();
});

// Initialize entrance animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Animate counter numbers
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const start = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeOutQuart * target);
            
            counter.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    });
}

// Setup timeline controls
function setupTimelineControls() {
    const timelineButtons = document.querySelectorAll('.timeline-btn');
    const timelineEras = document.querySelectorAll('.timeline-era');
    
    timelineButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (isAnimating) return;
            
            const era = this.getAttribute('data-era');
            if (era === currentEra) return;
            
            // Update button states
            timelineButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Switch timeline eras
            switchTimelineEra(era);
            currentEra = era;
        });
    });
}

// Switch timeline era with animation
function switchTimelineEra(newEra) {
    isAnimating = true;
    const currentEraEl = document.querySelector('.timeline-era.active');
    const newEraEl = document.querySelector(`.timeline-era[data-era="${newEra}"]`);
    
    // Fade out current era
    currentEraEl.style.opacity = '0';
    currentEraEl.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        currentEraEl.classList.remove('active');
        newEraEl.classList.add('active');
        
        // Fade in new era
        newEraEl.style.opacity = '0';
        newEraEl.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            newEraEl.style.opacity = '1';
            newEraEl.style.transform = 'translateY(0)';
            
            // Animate timeline items
            animateTimelineItems(newEraEl);
        });
        
        setTimeout(() => {
            isAnimating = false;
        }, 600);
    }, 300);
}

// Animate timeline items
function animateTimelineItems(eraEl) {
    const items = eraEl.querySelectorAll('.timeline-item');
    
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.6s ease-out';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Setup mission simulator
function setupMissionSimulator() {
    const missionType = document.getElementById('mission-type');
    const fuelLevel = document.getElementById('fuel-level');
    const crewSize = document.getElementById('crew-size');
    const fuelDisplay = document.getElementById('fuel-display');
    const crewDisplay = document.getElementById('crew-display');
    const launchBtn = document.getElementById('launch-btn');
    const successProb = document.getElementById('success-prob');
    const missionCost = document.getElementById('mission-cost');
    const missionDuration = document.getElementById('mission-duration');
    
    // Mission configurations
    const missions = {
        satellite: {
            baseCost: 50,
            baseDuration: '3 months',
            baseSuccess: 95,
            fuelMultiplier: 0.8,
            crewMultiplier: 0
        },
        moon: {
            baseCost: 400,
            baseDuration: '2 weeks',
            baseSuccess: 85,
            fuelMultiplier: 1.2,
            crewMultiplier: 50
        },
        mars: {
            baseCost: 2000,
            baseDuration: '2 years',
            baseSuccess: 70,
            fuelMultiplier: 2.5,
            crewMultiplier: 200
        },
        iss: {
            baseCost: 125,
            baseDuration: '6 months',
            baseSuccess: 98,
            fuelMultiplier: 1.0,
            crewMultiplier: 30
        }
    };
    
    // Update mission stats
    function updateMissionStats() {
        const mission = missions[missionType.value];
        const fuel = parseInt(fuelLevel.value);
        const crew = parseInt(crewSize.value);
        
        // Calculate derived stats
        const fuelCost = mission.baseCost * mission.fuelMultiplier * (fuel / 100);
        const crewCost = mission.crewMultiplier * crew;
        const totalCost = Math.round(fuelCost + crewCost);
        
        // Success probability based on fuel level
        const fuelBonus = Math.max(0, (fuel - 50) * 0.3);
        const crewPenalty = crew > 3 ? (crew - 3) * 2 : 0;
        const successRate = Math.min(99, Math.max(10, mission.baseSuccess + fuelBonus - crewPenalty));
        
        // Update displays
        successProb.textContent = `${Math.round(successRate)}%`;
        missionCost.textContent = `$${totalCost}M`;
        missionDuration.textContent = mission.baseDuration;
        
        // Store for launch simulation
        missionData = {
            type: missionType.value,
            fuel: fuel,
            crew: crew,
            success: successRate,
            cost: totalCost
        };
    }
    
    // Event listeners
    missionType.addEventListener('change', updateMissionStats);
    fuelLevel.addEventListener('input', function() {
        fuelDisplay.textContent = `${this.value}%`;
        updateMissionStats();
    });
    crewSize.addEventListener('input', function() {
        crewDisplay.textContent = this.value;
        updateMissionStats();
    });
    
    // Launch button
    launchBtn.addEventListener('click', launchMission);
    
    // Initialize
    updateMissionStats();
}
// Test button to check sound works before using it in the mission
document.getElementById('test-sound').addEventListener('click', () => {
    const sound = document.getElementById('animated-sound');
    sound.currentTime = 0;
    sound.volume = 0.6;
    sound.play().then(() => console.log("Sound playing!"))
                .catch(err => console.error("Sound play failed:", err));
});
// Launch mission animation
function launchMission() {
    const rocket = document.querySelector('.rocket');
    const sound = document.getElementById('animated-sound');
    const launchBtn = document.getElementById('launch-btn');
    
     if (missionData.fuel <= 0) {
        alert("Cannot launch: Fuel is empty!");
        return; // Stop launch if no fuel
    }
    sound.currentTime = 0;
    sound.volume = 0.6;
    sound.play().catch(err => console.warn("Audio play failed:", err));
    // Disable button during launch
    launchBtn.disabled = true;
    launchBtn.textContent = 'Launching...';
    rocket.classList.remove('launching');
    rocket.classList.add('launching');
    // Play launch sequence
    setTimeout(() => {
        const success = Math.random() * 100 < missionData.success;
        showMissionResult(success);
        // Reset rocket
        rocket.classList.remove('launching');
        launchBtn.disabled = false;
        launchBtn.textContent = 'Launch Mission';
    }, 3000);
}

// Show mission result
function showMissionResult(success) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'mission-result';
    resultDiv.innerHTML = `
        <div class="result-content">
            <h3>${success ? '🎉 Mission Successful!' : '❌ Mission Failed'}</h3>
            <p>${success ? 
                `The ${missionData.type} mission was completed successfully with ${missionData.crew} crew members.` :
                `The ${missionData.type} mission encountered technical difficulties. Better luck next time!`
            }</p>
            <button onclick="this.parentElement.parentElement.remove()">Continue</button>
        </div>
    `;
    
    // Style the result popup
    resultDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    resultDiv.querySelector('.result-content').style.cssText = `
        background: rgba(255,255,255,0.1);
        padding: 2rem;
        border-radius: 20px;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.2);
        text-align: center;
        max-width: 400px;
        color: white;
    `;
    
    resultDiv.querySelector('button').style.cssText = `
        margin-top: 1rem;
        padding: 0.8rem 1.5rem;
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        border: none;
        border-radius: 25px;
        color: white;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(resultDiv);
}

// Setup tooltips
function setupTooltips() {
    const tooltip = document.getElementById('tooltip');
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const tooltipText = this.getAttribute('data-tooltip');
            tooltip.querySelector('.tooltip-content').textContent = tooltipText;
            tooltip.style.display = 'block';
            tooltip.style.opacity = '1';
            updateTooltipPosition(e);
        });
        
        element.addEventListener('mouseleave', function() {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                tooltip.style.display = 'none';
            }, 200);
        });
        
        element.addEventListener('mousemove', updateTooltipPosition);
    });
    
    function updateTooltipPosition(e) {
        const rect = tooltip.getBoundingClientRect();
        const x = e.clientX + 10;
        const y = e.clientY - rect.height - 10;
        
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    }
}

// Setup progress animations
function setupProgressAnimations() {
    const progressRings = document.querySelectorAll('.progress-fill');
    const progressBars = document.querySelectorAll('.bar-fill');
    const futureProgressBars = document.querySelectorAll('.future-progress .progress-bar');
    
    // Animate circular progress rings
    progressRings.forEach(ring => {
        const percent = ring.getAttribute('data-percent');
        const circumference = 2 * Math.PI * 45; // radius = 45
        const offset = circumference - (percent / 100) * circumference;
        
        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = circumference;
        
        setTimeout(() => {
            ring.style.strokeDashoffset = offset;
        }, 500);
    });
    
    // Animate bar charts
    progressBars.forEach(bar => {
        const value = bar.getAttribute('data-value');
        setTimeout(() => {
            bar.style.width = `${value}%`;
        }, 800);
    });
    
    // Animate future progress bars
    futureProgressBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        setTimeout(() => {
            bar.style.width = `${progress}%`;
        }, 1000);
    });
}

// Setup future cards
function setupFutureCards() {
    const futureCards = document.querySelectorAll('.future-card');
    
    futureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.05)';
            this.style.boxShadow = '0 20px 40px rgba(255,255,255,0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
        
        // Add click interaction
        card.addEventListener('click', function() {
            const hover = this.getAttribute('data-hover');
            showFutureDetails(hover);
        });
    });
}

// Show future mission details
function showFutureDetails(type) {
    const details = {
        mars: {
            title: 'Mars Colonization',
            description: 'A comprehensive plan to establish the first permanent human settlement on Mars, including habitat construction, resource utilization, and sustainable life support systems.',
            timeline: '2035-2040',
            challenges: ['Radiation protection', 'Resource scarcity', 'Psychological isolation', 'Medical emergencies']
        },
        moon: {
            title: 'Lunar Base Development',
            description: 'Creating a sustainable research station on the Moon to serve as a stepping stone for deep space exploration and a testbed for Mars technologies.',
            timeline: '2028-2032',
            challenges: ['Extreme temperatures', 'Micrometeorite impacts', 'Limited resources', 'Communication delays']
        },
        asteroid: {
            title: 'Asteroid Mining Operations',
            description: 'Harvesting valuable minerals and rare earth elements from near-Earth asteroids to support space exploration and Earth-based industries.',
            timeline: '2030-2035',
            challenges: ['Precision navigation', 'Resource extraction', 'Economic viability', 'Orbital mechanics']
        },
        interstellar: {
            title: 'Interstellar Travel Research',
            description: 'Developing breakthrough propulsion technologies like fusion drives and solar sails to enable human travel to nearby star systems.',
            timeline: '2080-2100',
            challenges: ['Propulsion technology', 'Life support duration', 'Communication over vast distances', 'Generational ships']
        }
    };
    
    const detail = details[type];
    if (!detail) return;
    
    const modal = document.createElement('div');
    modal.className = 'future-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            <h2>${detail.title}</h2>
            <p class="timeline">Timeline: ${detail.timeline}</p>
            <p class="description">${detail.description}</p>
            <h3>Key Challenges:</h3>
            <ul class="challenges">
                ${detail.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
            </ul>
        </div>
    `;
    
    // Style the modal
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: rgba(255,255,255,0.1);
        padding: 2rem;
        border-radius: 20px;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.2);
        max-width: 600px;
        color: white;
        position: relative;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        color: white;
        font-size: 2rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    `;
    
    document.body.appendChild(modal);
}

// Setup scroll effects
function setupScrollEffects() {
    const sections = document.querySelectorAll('section');
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'all 0.8s ease-out';
        scrollObserver.observe(section);
    });
}

// Initialize charts
function initializeCharts() {
    // Animate pie chart
    const pieSlices = document.querySelectorAll('.pie-slice');
    let currentRotation = 0;
    
    pieSlices.forEach(slice => {
        const percent = parseFloat(slice.getAttribute('data-percent'));
        const circumference = 2 * Math.PI * 80;
        const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
        
        slice.style.strokeDasharray = strokeDasharray;
        slice.style.strokeDashoffset = '0';
        slice.style.transform = `rotate(${currentRotation}deg)`;
        slice.style.transformOrigin = '100px 100px';
        
        currentRotation += (percent / 100) * 360;
    });
    
    // Add hover effects to visualization cards
    const vizCards = document.querySelectorAll('.viz-card');
    vizCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 30px rgba(255,255,255,0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
}

// Add CSS animations for fadeIn
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes slideInTimeline {
        from { 
            opacity: 0; 
            transform: translateY(50px);
        }
        to { 
            opacity: 1; 
            transform: translateY(0);
        }
    }    
    .timeline-item {
        transition: all 0.6s ease-out;
    }
    
    .future-card {
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .viz-card {
        transition: all 0.3s ease;
    }
    
    .progress-fill {
        transition: stroke-dashoffset 2s ease-out;
    }
    
    .bar-fill {
        transition: width 1.5s ease-out;
        width: 0%;
    }
    
    .progress-bar {
        transition: width 1.5s ease-out;
        width: 0%;
    }
`;
document.head.appendChild(style);