/* Auto-extracted from content/udyan-lp/index.html inline scripts.
   Runs after DOM is ready because Next mounts LP HTML via React. */
(function () {
  if (window.__udyanInlineBooted) return;
  window.__udyanInlineBooted = true;
/* ---- inline boot block 1 ---- */
(function () {
var sectionIds = ['home', 'about', 'clubhouse', 'amenities', 'master-plan', 'floorplans', 'location', 'gallery'];
			var sections = [];
			var navLinksBySection = {};

			sectionIds.forEach(function (id) {
				var section = document.getElementById(id);
				if (section) sections.push({
					id: id,
					element: section
				});
				var links = document.querySelectorAll('.nav-link[href="#' + id + '"]');
				navLinksBySection[id] = links;
			});

			function setActive(sectionId) {
				sectionIds.forEach(function (id) {
					var links = navLinksBySection[id];
					if (links && links.length) {
						links.forEach(function (link) {
							if (id === sectionId) link.classList.add('active');
							else link.classList.remove('active');
						});
					}
				});
			}

			function getActiveSection() {
				var viewportCenter = window.scrollY + (window.innerHeight * 0.4);
				var activeId = sectionIds[0];
				for (var i = 0; i < sections.length; i++) {
					var el = sections[i].element;
					var top = el.getBoundingClientRect().top + window.scrollY;
					var bottom = top + el.offsetHeight;
					if (top <= viewportCenter && bottom >= viewportCenter) {
						activeId = sections[i].id;
						break;
					}
					if (top > viewportCenter) break;
					activeId = sections[i].id;
				}
				return activeId;
			}

			function updateActive() {
				setActive(getActiveSection());
			}

			var ticking = false;
			window.addEventListener('scroll', function () {
				if (!ticking) {
					requestAnimationFrame(function () {
						updateActive();
						ticking = false;
					});
					ticking = true;
				}
			}, {
				passive: true
			});

			updateActive();
})();

/* ---- inline boot block 2 ---- */
(function () {
const statsBox = document.querySelector('#about .stats-box');
			const counters = document.querySelectorAll('.counter');
			const speed = 200;
			let started = false;

			function animateCounters() {
				counters.forEach(counter => {
					const updateCount = () => {
						const target = +counter.getAttribute('data-target');
						const current = +counter.innerText.replace(/,/g, '') || 0;
						const inc = Math.ceil(target / speed);

						if (current < target) {
							counter.innerText = (current + inc).toLocaleString();
							setTimeout(updateCount, 20);
						} else {
							counter.innerText = target.toLocaleString();
						}
					};
					updateCount();
				});
			}

			// Use IntersectionObserver for performance
			const observer = new IntersectionObserver(entries => {
				entries.forEach(entry => {
					if (entry.isIntersecting && !started) {
						statsBox.classList.add('slide-in');
						// wait for slide animation to finish before counting
						setTimeout(animateCounters, 1000);
						started = true;
						observer.disconnect();
					}
				});
			}, {
				threshold: 0.5
			});

			observer.observe(statsBox);
})();

/* ---- inline boot block 3 ---- */
(function () {
var slider = document.querySelector('.clubhouse-slider');
			if (!slider) return;

			var slides = slider.querySelector('.slides');
			var slideItems = slider.querySelectorAll('.slide-item');
			var totalSlides = slideItems.length;
			var currentIndex = 0;

			var prevBtn = slider.querySelector('.prev');
			var nextBtn = slider.querySelector('.next');

			function goToSlide(index) {
				currentIndex = (index + totalSlides) % totalSlides;
				slides.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
			}

			function nextSlide() {
				goToSlide(currentIndex + 1);
			}

			function prevSlide() {
				goToSlide(currentIndex - 1);
			}

			if (nextBtn) nextBtn.addEventListener('click', nextSlide);
			if (prevBtn) prevBtn.addEventListener('click', prevSlide);

			// Auto-slide every 3 seconds
			var autoSlideInterval = setInterval(nextSlide, 3000);

			// Pause auto-slide on hover
			slider.addEventListener('mouseenter', function () {
				clearInterval(autoSlideInterval);
			});
			slider.addEventListener('mouseleave', function () {
				autoSlideInterval = setInterval(nextSlide, 5000);
			});
})();

/* ---- inline boot block 4 ---- */
(function () {
const openBtn = document.getElementById("openPanel");
		const openBtnMobile = document.getElementById("openPanell");
		const closeBtn = document.getElementById("closePanel");
		const panel = document.getElementById("locationPanel");

		function openPanel() {
			if (panel) panel.classList.add("active");
		}

		function closePanelFn() {
			if (panel) panel.classList.remove("active");
		}

		if (openBtn) openBtn.addEventListener("click", openPanel);
		if (openBtnMobile) openBtnMobile.addEventListener("click", openPanel);
		if (closeBtn) closeBtn.addEventListener("click", closePanelFn);

		// Accordion inside Location Highlights panel
		const accBtns = document.querySelectorAll(".location-panel .acc-btn");
		accBtns.forEach(btn => {
			btn.addEventListener("click", function () {
				const content = this.nextElementSibling;
				document.querySelectorAll(".location-panel .acc-content").forEach(item => {
					if (item !== content) item.classList.remove("show");
				});
				content.classList.toggle("show");
			});
		});
})();

/* ---- inline boot block 5 ---- */
(function () {
(function () {
			const slider = document.getElementById('slider');
			if (!slider) return;

			const radios = slider.querySelectorAll('input[type="radio"]');
			const nextBtn = slider.querySelector('.next');
			const prevBtn = slider.querySelector('.prev');

			if (radios.length === 0 || !nextBtn || !prevBtn) return;

			let current = 0;

			function showSlide(index) {
				radios[current].checked = false;
				current = (index + radios.length) % radios.length;
				radios[current].checked = true;
			}

			nextBtn.addEventListener("click", function () {
				showSlide(current + 1);
			});

			prevBtn.addEventListener("click", function () {
				showSlide(current - 1);
			});
		})();
})();

/* ---- inline boot block 6 ---- */
(function () {
if (document.getElementById('lightbox')) return;
// Create lightbox container
			const lightbox = document.createElement('div');
			lightbox.id = 'lightbox';
			lightbox.innerHTML = `
            <div class="lightbox-content">
                <span class="close" title="Close (Esc)">&times;</span>
                <img id="lightbox-img" src="" alt="" loading="eager">
                <div class="zoom-controls">
                    <div class="zoom-level" id="zoom-level">100%</div>
                    <button class="zoom-btn" id="zoom-in" title="Zoom In">+</button>
                    <button class="zoom-btn" id="zoom-out" title="Zoom Out">-</button>
                    <button class="zoom-btn" id="zoom-reset" title="Reset Zoom">↺</button>
                </div>
            </div>`;
			document.body.appendChild(lightbox);

			// Lightbox elements
			const lightboxImg = document.getElementById('lightbox-img');
			const lightboxElement = document.getElementById('lightbox');
			const closeBtn = lightbox.querySelector('.close');

			// State
			let isZoomed = false;
			let isAnimating = false;

			// Toggle zoom on image click
			lightboxImg.addEventListener('click', function (e) {
				if (isAnimating) return;
				isAnimating = true;

				isZoomed = !isZoomed;
				this.classList.toggle('zoomed', isZoomed);

				// Reset animation lock after transition
				setTimeout(() => {
					isAnimating = false;
				}, 200);

				e.stopPropagation();
			});

			// Close lightbox
			function closeLightbox() {
				lightbox.classList.remove('active');
				document.body.style.overflow = 'auto';

				// Reset zoom state after close
				setTimeout(() => {
					lightboxImg.src = '';
					lightboxImg.classList.remove('zoomed');
					isZoomed = false;
				}, 200);
			}

			// Add click event to all lightbox images
			document.addEventListener('click', function (e) {
				const img = e.target.closest('.zoomable-image');
				if (img) {
					e.preventDefault();
					lightboxImg.src = img.src;
					lightbox.classList.add('active');
					document.body.style.overflow = 'hidden';
					isZoomed = false;
				}
			});

			// Close lightbox when clicking outside image or on close button
			lightbox.addEventListener('click', function (e) {
				if (e.target === lightbox || e.target.classList.contains('close')) {
					closeLightbox();
				}
			});

			// Close with ESC key
			document.addEventListener('keydown', function (e) {
				if (e.key === 'Escape' && lightbox.classList.contains('active')) {
					closeLightbox();
				}
			});

			document.body.appendChild(lightbox);

			// Lightbox elements
			const lightboxImg2 = document.getElementById('lightbox-img');
			const lightboxElement2 = document.getElementById('lightbox');
			const lightboxContent = document.querySelector('.lightbox-content');
			const zoomInBtn = document.getElementById('zoom-in');
			const zoomOutBtn = document.getElementById('zoom-out');
			const zoomResetBtn = document.getElementById('zoom-reset');
			const zoomLevel = document.getElementById('zoom-level');

			// Zoom state
			let scale = 1;
			let isPanning = false;
			let startX, startY, translateX = 0,
				translateY = 0;

			// Update zoom level display
			function updateZoomLevel() {
				zoomLevel.textContent = Math.round(scale * 100) + '%';
			}

			// Apply transform to image
			function applyTransform() {
				lightboxImg.style.transform = 'scale(' + scale + ') translate(' + translateX + 'px, ' + translateY + 'px)';
				updateZoomLevel();
			}

			// Reset zoom and position
			function resetZoom() {
				scale = 1;
				translateX = 0;
				translateY = 0;
				applyTransform();
			}

			// Zoom functions
			function zoomIn() {
				scale = Math.min(scale + 0.25, 4);
				applyTransform();
			}

			function zoomOut() {
				scale = Math.max(scale - 0.25, 0.5);
				// If zoomed out completely, reset position
				if (scale <= 1) {
					translateX = 0;
					translateY = 0;
				}
				applyTransform();
			}

			// Mouse and touch events for panning
			function startPan(e) {
				if (scale <= 1) return;
				isPanning = true;
				startX = e.clientX - translateX;
				startY = e.clientY - translateY;
				lightboxContent.classList.add('panning');
			}

			function pan(e) {
				if (!isPanning) return;
				e.preventDefault();
				translateX = e.clientX - startX;
				translateY = e.clientY - startY;
				applyTransform();
			}

			function stopPan() {
				isPanning = false;
				lightboxContent.classList.remove('panning');
			}

			// Event listeners for zoom controls
			zoomInBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				zoomIn();
			});

			zoomOutBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				zoomOut();
			});

			zoomResetBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				resetZoom();
			});

			// Mouse wheel for zooming
			lightboxImg.addEventListener('wheel', (e) => {
				e.preventDefault();
				if (e.deltaY < 0) {
					zoomIn();
				} else {
					zoomOut();
				}
			});

			// Touch events for mobile
			lightboxImg.addEventListener('touchstart', (e) => {
				if (e.touches.length === 2) {
					// Handle pinch zoom
					e.preventDefault();
					const touch1 = e.touches[0];
					const touch2 = e.touches[1];
					const dist = Math.hypot(
						touch2.pageX - touch1.pageX,
						touch2.pageY - touch1.pageY
					);
					lightboxImg.dataset.dist = dist;
				} else if (scale > 1) {
					startPan(e.touches[0]);
				}
			});

			lightboxImg.addEventListener('touchmove', (e) => {
				if (e.touches.length === 2) {
					// Handle pinch zoom
					e.preventDefault();
					const touch1 = e.touches[0];
					const touch2 = e.touches[1];
					const dist = Math.hypot(
						touch2.pageX - touch1.pageX,
						touch2.pageY - touch1.pageY
					);
					const initialDist = parseFloat(lightboxImg.dataset.dist) || dist;
					const scaleChange = dist / initialDist;

					// Calculate new scale with limits
					const newScale = Math.min(Math.max(scale * scaleChange, 0.5), 4);
					scale = newScale;

					// Update the initial distance for smooth zooming
					lightboxImg.dataset.dist = dist;

					applyTransform();
				} else if (isPanning) {
					pan(e.touches[0]);
				}
			}, {
				passive: false
			});

			lightboxImg.addEventListener('touchend', stopPan);

			// Mouse events for desktop
			lightboxImg.addEventListener('mousedown', (e) => {
				if (e.button === 0 && scale > 1) { // Left mouse button
					startPan(e);
				}
			});

			document.addEventListener('mousemove', pan);
			document.addEventListener('mouseup', stopPan);
			document.addEventListener('mouseleave', stopPan);

			// Keyboard controls
			document.addEventListener('keydown', (e) => {
				if (lightboxElement.style.display !== 'flex') return;

				switch (e.key) {
					case 'Escape':
						lightboxElement.style.display = 'none';
						document.body.style.overflow = 'auto';
						resetZoom();
						break;
					case 'ArrowUp':
						if (scale > 1) {
							translateY += 20;
							applyTransform();
						}
						break;
					case 'ArrowDown':
						if (scale > 1) {
							translateY -= 20;
							applyTransform();
						}
						break;
					case 'ArrowLeft':
						if (scale > 1) {
							translateX += 20;
							applyTransform();
						}
						break;
					case 'ArrowRight':
						if (scale > 1) {
							translateX -= 20;
							applyTransform();
						}
						break;
					case '+':
					case '=':
						zoomIn();
						break;
					case '-':
						zoomOut();
						break;
					case '0':
						resetZoom();
						break;
				}
			});

			// Add click event to all lightbox images
			const lightboxImages = document.querySelectorAll('img[data-lightbox]');
			lightboxImages.forEach(image => {
				image.classList.add('lightbox-image');
				image.addEventListener('click', e => {
					e.preventDefault();
					lightboxImg.src = image.src;
					lightboxElement.style.display = 'flex';
					document.body.style.overflow = 'hidden';
					resetZoom(); // Reset zoom when opening a new image
				});
			});

			// Close lightbox when clicking outside image or on close button
			lightbox.addEventListener('click', e => {
				if (e.target === lightbox || e.target.classList.contains('close')) {
					lightbox.style.display = 'none';
					document.body.style.overflow = 'auto';
					resetZoom();
				}
			});
})();

/* ---- inline boot block 7 ---- */
(function () {
const accordionBtns = document.querySelectorAll('.accordion-btn');

			accordionBtns.forEach(btn => {
				btn.addEventListener('click', function () {
					// Toggle active class on the clicked button
					this.classList.toggle('active');

					// Toggle the panel
					const panel = this.nextElementSibling;
					if (panel.style.maxHeight) {
						panel.style.maxHeight = null;
						this.querySelector('i').className = 'fas fa-plus';
					} else {
						// Close all other panels
						closeAllPanels(this);

						// Open this panel
						panel.style.maxHeight = panel.scrollHeight + 'px';
						this.querySelector('i').className = 'fas fa-minus';
					}
				});
			});

			function closeAllPanels(exceptThis = null) {
				accordionBtns.forEach(btn => {
					if (btn !== exceptThis) {
						btn.classList.remove('active');
						const panel = btn.nextElementSibling;
						panel.style.maxHeight = null;
						btn.querySelector('i').className = 'fas fa-plus';
					}
				});
			}
})();

/* ---- inline boot block 8 ---- */
(function () {
const accordionBtns = document.querySelectorAll(".accordion-btnn");

		accordionBtns.forEach(btn => {
			btn.addEventListener("click", function () {
				const content = this.nextElementSibling;
				const icon = this.querySelector(".icon");

				document.querySelectorAll(".accordion-content").forEach(item => {
					if (item !== content) {
						item.classList.remove("show");
						item.previousElementSibling.querySelector(".icon").textContent = "+";
					}
				});

				content.classList.toggle("show");
				icon.textContent = content.classList.contains("show") ? "−" : "+";
			});
		});
})();

})();
