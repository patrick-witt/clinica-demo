/**
 * main.js - Clínica Sorriso Pleno
 * Lógica de UI e Interações
 */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileMenu();
    initHeaderScroll();
    initScrollSpy();
    initIntersectionObserver();
    initCounters();
    initTestimonialsCarousel();
    initAppointmentForm();
    initLGPD();
});

/* =========================================
   1. TEMA CLARO / ESCURO
   ========================================= */
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Verifica preferência salva
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        // Verifica preferência do sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            htmlElement.setAttribute('data-theme', 'dark');
        }
    }

    // Toggle
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

/* =========================================
   2. MENU MOBILE
   ========================================= */
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Fechar menu ao clicar em um link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

/* =========================================
   3. HEADER SCROLL EFFECT
   ========================================= */
function initHeaderScroll() {
    const header = document.getElementById('header');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Init
}

/* =========================================
   4. SCROLL SPY (Ativar link do menu atual)
   ========================================= */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const handleScrollSpy = () => {
        let currentId = '';
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100; // Offset para o header
            const sectionHeight = section.offsetHeight;

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentId}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScrollSpy);
}

/* =========================================
   5. INTERSECTION OBSERVER (Animações de entrada)
   ========================================= */
function initIntersectionObserver() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Anima apenas uma vez
            }
        });
    }, {
        threshold: 0.1, // Dispara quando 10% do elemento está visível
        rootMargin: "0px 0px -50px 0px"
    });

    animatedElements.forEach(el => observer.observe(el));
}

/* =========================================
   6. CONTADORES ANIMADOS
   ========================================= */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    let hasAnimated = false;

    const animateCounters = () => {
        counters.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const isDecimal = counter.getAttribute('data-decimal') === 'true';
            const duration = 2000; // 2 segundos
            const stepTime = 20;
            const steps = duration / stepTime;
            const increment = target / steps;
            
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                
                if (current >= target) {
                    counter.innerText = isDecimal ? target.toFixed(1) : Math.floor(target);
                    clearInterval(timer);
                } else {
                    counter.innerText = isDecimal ? current.toFixed(1) : Math.floor(current);
                }
            }, stepTime);
        });
    };

    // Usar Intersection Observer para disparar apenas quando visível
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
            animateCounters();
            hasAnimated = true;
            observer.disconnect();
        }
    }, { threshold: 0.5 });

    observer.observe(statsSection);
}

/* =========================================
   7. CARROSSEL DE DEPOIMENTOS
   ========================================= */
function initTestimonialsCarousel() {
    const track = document.querySelector('.carousel-track');
    const cards = Array.from(document.querySelectorAll('.testimonial-card'));
    const indicatorsContainer = document.getElementById('carousel-indicators');
    
    if (!track || cards.length === 0) return;

    let currentIndex = 0;
    const totalCards = cards.length;
    let autoPlayInterval;

    // Criar indicadores
    cards.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.classList.add('indicator');
        if (index === 0) btn.classList.add('active');
        btn.setAttribute('aria-label', `Ir para slide ${index + 1}`);
        btn.addEventListener('click', () => goToSlide(index));
        indicatorsContainer.appendChild(btn);
    });

    const indicators = document.querySelectorAll('.indicator');

    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        indicators.forEach((ind, index) => {
            if (index === currentIndex) {
                ind.classList.add('active');
            } else {
                ind.classList.remove('active');
            }
        });
    }

    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
        resetAutoPlay();
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalCards;
        updateCarousel();
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 4000); // 4 segundos
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    // Iniciar autoplay
    startAutoPlay();

    // Pausar ao passar o mouse
    track.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    track.addEventListener('mouseleave', startAutoPlay);
}

/* =========================================
   8. FORMULÁRIO DE AGENDAMENTO (Mock)
   ========================================= */
function initAppointmentForm() {
    const form = document.getElementById('appointment-form');
    const messageBox = document.getElementById('form-message');
    
    if (!form) return;

    // Configurar data mínima para hoje no datepicker
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Obter o botão de submit para estado de carregamento
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        
        submitBtn.innerText = 'Enviando...';
        submitBtn.disabled = true;

        // Simular requisição assíncrona (delay de 1.5s)
        setTimeout(() => {
            // Mostrar mensagem de sucesso
            messageBox.classList.remove('hidden');
            
            // Limpar formulário
            form.reset();
            
            // Restaurar botão
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;

            // Esconder mensagem após 5 segundos
            setTimeout(() => {
                messageBox.classList.add('hidden');
            }, 5000);
            
        }, 1500);
    });
}

/* =========================================
   9. LGPD E MODAL
   ========================================= */
function initLGPD() {
    // Cookie Banner
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    
    if (banner && acceptBtn) {
        if (!localStorage.getItem('cookiesAccepted')) {
            banner.classList.remove('hidden');
            setTimeout(() => banner.classList.add('show'), 100);
        }

        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            banner.classList.remove('show');
            setTimeout(() => banner.classList.add('hidden'), 300);
        });
    }

    // Modal de Privacidade
    const modal = document.getElementById('privacy-modal');
    const openBtns = document.querySelectorAll('.open-privacy-modal');
    const closeBtns = document.querySelectorAll('.close-privacy-modal');

    if (modal) {
        openBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.remove('hidden');
                setTimeout(() => modal.classList.add('show'), 10);
            });
        });

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => modal.classList.add('hidden'), 300);
            });
        });
    }
}
