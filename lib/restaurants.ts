// Temple retail spots that take meal swipes. Sources: Temple Housing dining page and
// the Morgan Hall / Student Center food court listings. Coffee and convenience
// outlets (e.g. Starbucks) are excluded from meal swipes, so they are not listed.
// Re-check against temple.campusdish.com each semester.

export type Restaurant = {
  slug: string;
  name: string;
  location?: string;
  /** Background color for the fallback logo badge. */
  brandColor: string;
  /** Optional logo in /public, e.g. "/restaurants/chick-fil-a.svg". */
  logoSrc?: string;
};

const MORGAN = "Morgan Hall food court";
const STUDENT_CENTER = "Student Center food court";

export const restaurants: Restaurant[] = [
  { slug: "chick-fil-a", name: "Chick-fil-A", location: "Morgan Hall & Student Center", brandColor: "#dd0033", logoSrc: "/restaurants/chick-fil-a.png" },
  { slug: "panda-express", name: "Panda Express", location: MORGAN, brandColor: "#c8102e", logoSrc: "/restaurants/panda-express.png" },
  { slug: "wingstop", name: "Wingstop", location: STUDENT_CENTER, brandColor: "#006938", logoSrc: "/restaurants/wingstop.png" },
  { slug: "panera-bread", name: "Panera Bread", brandColor: "#5c6b2e", logoSrc: "/restaurants/panera-bread.png" },
  { slug: "honeygrow", name: "honeygrow", location: MORGAN, brandColor: "#d6336c", logoSrc: "/restaurants/honeygrow.png" },
  { slug: "saladworks", name: "Saladworks", location: STUDENT_CENTER, brandColor: "#5a9e2f", logoSrc: "/restaurants/saladworks.png" },
  { slug: "burgerfi", name: "BurgerFi", location: STUDENT_CENTER, brandColor: "#0b5d3b", logoSrc: "/restaurants/burgerfi.png" },
  { slug: "which-wich", name: "Which Wich", location: STUDENT_CENTER, brandColor: "#d71920", logoSrc: "/restaurants/which-wich.png" },
  { slug: "twisted-taco", name: "Twisted Taco", location: STUDENT_CENTER, brandColor: "#e8761e", logoSrc: "/restaurants/twisted-taco.png" },
  { slug: "zen", name: "Zen", location: STUDENT_CENTER, brandColor: "#334155" },
  { slug: "freshens", name: "Freshëns", location: MORGAN, brandColor: "#0091c9", logoSrc: "/restaurants/freshens.png" },
  { slug: "fresh-food-studio", name: "Fresh Food Studio", brandColor: "#0f9d74" },
];

export function getRestaurant(slug: string) {
  return restaurants.find((restaurant) => restaurant.slug === slug);
}
