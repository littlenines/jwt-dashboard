export type SelectOption = {
  label: string;
  value: string;
};

export const findSelectedOption = (options: SelectOption[], value: string) =>
  options.find((option) => option.value === value);
