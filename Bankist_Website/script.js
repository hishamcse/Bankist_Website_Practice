'use strict';

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
const nav = document.querySelector('.nav');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

///////////////////////////////////////
// Modal window

const openModal = (e) => {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = () => {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(e => e.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

///////////////////////////////////////
// Scrolling

btnScrollTo.addEventListener('click', e => {
  const sec1Coords = section1.getBoundingClientRect();
  console.log(sec1Coords);

  console.log(e.target.getBoundingClientRect());       // e.target is equal to btnScrollTo

  console.log('Current Scroll (Width/Height): ', window.pageXOffset, window.pageYOffset);

  console.log('Current scroll viewport ', document.documentElement.clientHeight, document.documentElement.clientWidth);

  // scrolling manual way (by knowing the coordinates)

  // not smooth
  // window.scrollTo(sec1Coords.left + window.pageXOffset,sec1Coords.top + window.pageYOffset);   // as top and left value is actually the length from the top and left of the viewport

  // smooth
  // window.scrollTo({
  //   left: sec1Coords.left + window.pageXOffset,
  //   top: sec1Coords.top + window.pageYOffset,
  //   behavior: 'smooth'
  // });

  // scrolling newer and smart way
  section1.scrollIntoView({ behavior: 'smooth' });
});

///////////////////////////////////////
// Page Navigation

// inefficient way (as we are adding same callback function to all links of the nav)
// document.querySelectorAll('.nav__link').forEach(link => {
//   link.addEventListener('click', function(e) {   // can't use arrow function as we need this keyword in action
//     e.preventDefault();
//
//     const id = this.getAttribute('href');    // as we want relative url. not absolute
//     console.log(id);
//
//     document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
//   });
// });

// efficient way (using event delegation which uses bubbling)
document.querySelector('.nav__links').addEventListener('click', e => {
  if(!e.target.classList.contains('nav__link--btn')) {
    e.preventDefault();     // for not directly go to href as it is default behaviour of it

    if (e.target.classList.contains('nav__link')) {   // checking condition
      const id = e.target.getAttribute('href');
      // console.log(id);
      document.querySelector(id).scrollIntoView({behavior: 'smooth'});
    }
  }
});

///////////////////////////////////////
// Tabbed Component

// one way
// tabsContainer.addEventListener('click', e => {
//   e.preventDefault();
//
//   if (e.target.classList.contains('operations__tab')) {
//
//     tabs.forEach(el => {
//       el.classList.remove('operations__tab--active');
//     });
//     tabsContent.forEach(el => {
//       el.classList.remove('operations__content--active');
//     });
//
//     document.querySelector(`.operations__tab--${e.target.dataset.tab}`).classList.add('operations__tab--active');
//     document.querySelector(`.operations__content--${e.target.dataset.tab}`).classList.add('operations__content--active');
//   }
// });

// another way (smart)
tabsContainer.addEventListener('click', e => {
  // will return itself or its ancestor. why it is needed. because we have a span class showing the number.
  // now when we click the number span class will be triggered. but we want the whole button to work.
  // that's why we need closest. In this case it will always find the element itself or any of the ancestor of it which
  // has the operations__tab class. if it finds, it will trigger instantaneously. Now it will work always perfectly
  const clicked = e.target.closest('.operations__tab');

  // guard clause
  if (!clicked) return;

  // active class removed from all tabs
  tabs.forEach(el => {
    el.classList.remove('operations__tab--active');
  });
  // active class removed from all content under operations
  tabsContent.forEach(el => {
    el.classList.remove('operations__content--active');
  });

  // adding active to necessary tab
  clicked.classList.add('operations__tab--active');
  // adding active to necessary container
  document.querySelector(`.operations__content--${clicked.dataset.tab}`).classList.add('operations__content--active');
});

///////////////////////////////////////
// Menu Fade animation

const fadeAnimation = function(e) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('.nav__logo');

    siblings.forEach(el => {
      if (el !== link) {
        el.style.opacity = this;           // as this is now capacity
      }
    });
    logo.style.opacity = this;
  }
};

// passing argument to event handler         // as mounseenter doesn't bubble up. so, we will use mouseover. otherwise both are same
nav.addEventListener('mouseover', fadeAnimation.bind(0.5));         // or e => fadeAnimation(e, 0.5)
nav.addEventListener('mouseout', fadeAnimation.bind(1));            // or e => fadeAnimation(e, 1)

///////////////////////////////////////
// Sticky Navigation

// Naive way
// window.addEventListener('scroll', () => {
//   if (window.scrollY >= section1.getBoundingClientRect().top + window.pageYOffset) {
//     nav.classList.add('sticky');
//   } else {
//     nav.classList.remove('sticky');
//   }
// });

// smart and efficient way (intersection Observer API)
const header = document.querySelector('.header');

const observerCallBack = entries => {
  const [entry] = entries;
  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
};

const observerOptions = {
  root: null,                     // by which the target section will intersect. null means the whole window (means viewport)
  threshold: 0,                   // percentage of intersection between root and target. this can be an array or single element too
  rootMargin: `-${nav.clientHeight}px`     // as we want to see the navbar when it is before the margin of section1 and width is same as that (-90px)
//  rootMargin: `-${nav.getBoundingClient().height}px`
};

const observer = new IntersectionObserver(observerCallBack, observerOptions);
observer.observe(header);

///////////////////////////////////////
// Revealing Elements on scroll

const sections = document.querySelectorAll('.section');

const revealObserverCallBack = (entries, observer) => {
  const [entry] = entries;
  if (!entry.isIntersecting) return;

  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target);                  // as we don't need them after revealing once
};

const revealObserverOptions = {
  root: null,
  threshold: 0.1
};

const revealObserver = new IntersectionObserver(revealObserverCallBack, revealObserverOptions);
sections.forEach(section => {
  section.classList.add('section--hidden');
  revealObserver.observe(section);
});

///////////////////////////////////////
// Lazy Loading Images

const feature_images = document.querySelectorAll('.features__img');        // or document.querySelectorAll('img[data-src]');

const feature_Observer_Callback = (entries, observer) => {
  const [entry] = entries;
  if (!entry.isIntersecting) return;

  entry.target.src = entry.target.dataset.src;

  entry.target.addEventListener('load', () => {
    entry.target.classList.remove('lazy-img');     // after loading the new image, we will remove the lazy class. because network issue can happen
  });

  observer.unobserve(entry.target);
};

const feature_Observer_Options = {
  root: null,
  threshold: 0.4
};

const feature_ImgObserver = new IntersectionObserver(feature_Observer_Callback, feature_Observer_Options);
feature_images.forEach(image => {
  feature_ImgObserver.observe(image);
});

///////////////////////////////////////
// Slider Component

const slider = () => {
  const slides = document.querySelectorAll('.slide');
  const btn_left = document.querySelector('.slider__btn--left');
  const btn_right = document.querySelector('.slider__btn--right');
  const dotBtns = document.querySelector('.dots');
  let cur_Slide = 0;

// Slider Dots
  const createDots = () => {
    // one way
    // slides.forEach((slide, i) => {
    //   const dot = document.createElement('button');
    //   dot.classList.add('dots__dot');
    //   dot.setAttribute('data-slide', `${i}`);
    //   dotBtns.insertAdjacentElement('beforeend', dot);
    // });

    // or
    slides.forEach(function(_, i) {
      dotBtns.insertAdjacentHTML('beforeend',
        `<button class='dots__dot' data-slide='${i}'></button>`
      );
    });
  };

  const set_slideDot_position = (slideNo) => {
    slides.forEach((slide, i) => {
      slide.style.transform = `translateX(${100 * (i - slideNo)}%)`;
    });
    // document.querySelectorAll('.dots__dot').forEach(el => {
    //   if (Number(el.dataset.slide) === slideNo) el.classList.add('dots__dot--active');
    //   else el.classList.remove('dots__dot--active');
    // });

    // or.
    document.querySelectorAll('.dots__dot').forEach(el => {
      el.classList.remove('dots__dot--active');
    });
    document.querySelector(`.dots__dot[data-slide="${slideNo}"]`).classList.add('dots__dot--active');
  };

  const init = () => {
    createDots();
    set_slideDot_position(0);
  };
  init();

  const nextSlide = () => {
    if (cur_Slide === slides.length - 1) cur_Slide = -1;
    cur_Slide++;
    set_slideDot_position(cur_Slide);
  };

  const prevSlide = () => {
    if (cur_Slide === 0) cur_Slide = slides.length;
    cur_Slide--;
    set_slideDot_position(cur_Slide);
  };

// button click events
  btn_right.addEventListener('click', nextSlide);
  btn_left.addEventListener('click', prevSlide);

// keyboard events
  document.addEventListener('keydown', e => {
    // if (e.key === 'ArrowRight') nextSlide();
    // if (e.key === 'ArrowLeft') prevSlide();
    e.key === 'ArrowRight' && nextSlide();
    e.key === 'ArrowLeft' && prevSlide();
  });

// dot click events
  dotBtns.addEventListener('click', e => {
    if (e.target.classList.contains('dots__dot'))
      set_slideDot_position(Number(e.target.dataset.slide));
  });
};

slider();