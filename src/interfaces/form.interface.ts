export type TColor = {
  [param: string]: {
    border: string;
    text?: string;
    hover?: string;
  };
};
export const color: TColor = {
  blue: {
    border: "input-border-blue",
    text: "input-text-blue",
    hover: "hover:text-blue-500",
  },
  green: {
    border: "input-border-green",
    text: "input-text-green",
    hover: "hover:text-green-500",
  },
};
