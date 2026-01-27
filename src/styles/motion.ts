export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

export const stagger = {
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

export const slideDown = {
  hidden: { opacity: 0, height: 0 },
  show: { 
    opacity: 1, 
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
}
