export const LottieAnimations = {
  LOGIN: {
    name: "Login",
    path: "/animations/login.lottie",
  },
  DEVELOPER: {
    name: "Developer",
    path: "/animations/developer.lottie",
  },
  DEVELOPER_SKILLS: {
    name: "Developer Skills",
    path: "/animations/developer-skills.lottie",
  },
  ERROR_404: {
    name: "404",
    path: "/animations/404.lottie",
  },
  CHRISTMAS_TREE: {
    name: "Christmas Tree",
    path: "/animations/christmas-tree.lottie",
  },
  DYNAMIC_QUAD_CUBES: {
    name: "Dynamic Quad Cubes",
    path: "/animations/dynamic-quad-cubes.lottie",
  },
  REACT_ICON: {
    name: "React Icon",
    path: "/animations/react-icon.lottie",
  },
  PROGRAMMERS: {
    name: "Programmers",
    path: "/animations/programmers.lottie",
  },
  LEGO: {
    name: "Lego",
    path: "/animations/lego.lottie",
  },
  PERSON: {
    name: "Person",
    path: "/animations/person.lottie",
  },
} as const;

export type LottieAnimationKey = (typeof LottieAnimations)[keyof typeof LottieAnimations];
