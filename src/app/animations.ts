import { animate, animateChild, group, query, style, transition, trigger } from "@angular/animations";

export const slideAnimation =
  trigger('routeAnimations', [
    transition('Home => 1, 1 => 2, 2 => 3, 1 => 3', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          width: '100%',
          top: 0,
          left: 0
        })
      ], { optional: true }),
      query(':enter', [
        style({ transform: 'translateX(100%)' })
      ], { optional: true }),
      query(':leave', animateChild(), { optional: true }),
      group([
        query(':enter', [
          animate('150ms ease-in', style({ transform: 'translateX(0)' }))
        ], { optional: true }),
        query('@*', animateChild(), { optional: true })
      ]),
    ]),
    // Transition from 'ArtistAlbums' to 'Artists'
    transition('1 => Home, 2 => 1, 3 => 2, 3 => 1', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          width: '100%',
          top: 0,
          left: 0
        })
      ], { optional: true }),

      // Animate leaving view to slide out to the right
      query(':leave', [
        style({
          transform: 'translateX(0)', // Apply initial position
          zIndex: 1, // Ensure the leaving view is behind the entering view
          opacity: 1 // Ensure the leaving view is visible initially
        }),
        animate('150ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ], { optional: true }),

      // Animate entering view to slide in from the left
      query(':enter', [
        style({
          transform: 'translateX(-100%)', // Apply initial position
          zIndex: 2 // Ensure the entering view is above the leaving view
        }),
      ], { optional: true }),

      // Animate child elements when leaving and entering
      group([
        query('@*', animateChild(), { optional: true })
      ]),
    ]),




    transition('* => drawer, player => drawer', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          width: '100%',
          top: 0,
          left: 0
        })
      ], { optional: true }),
      query(':enter', [
        style({ transform: 'translateY(100%)' })
      ], { optional: true }),
      query(':leave', animateChild(), { optional: true }),
      group([
        query(':enter', [
          animate('300ms ease-in', style({ transform: 'translateY(0)' }))
        ], { optional: true }),
        query('@*', animateChild(), { optional: true })
      ]),
    ]),


    transition('drawer => *, drawer => player', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          width: '100%',
          top: 0,
          left: 0
        })
      ], { optional: true }),

      // Animate leaving view to slide out to the right
      query(':leave', [
        style({
          transform: 'translateY(0)', // Apply initial position
          zIndex: 1, // Ensure the leaving view is behind the entering view
          opacity: 1 // Ensure the leaving view is visible initially
        }),
        animate('300ms ease-in', style({ transform: 'translateY(100%)' }))
      ], { optional: true }),

      // Animate entering view to slide in from the left
      query(':enter', [
        style({
          transform: 'translateY(-100%)', // Apply initial position
          zIndex: 2 // Ensure the entering view is above the leaving view
        }),
      ], { optional: true }),

      // Animate child elements when leaving and entering
      group([
        query('@*', animateChild(), { optional: true })
      ]),
    ]),
  ]);
