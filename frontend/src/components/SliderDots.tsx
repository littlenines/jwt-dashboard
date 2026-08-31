import styles from "@/styles/components/SliderDots.module.scss";

type SliderDotsProps = {
  count: number;
  active: number;
};

const SliderDots = ({ count, active }: SliderDotsProps) => (
  <div className={styles.slider_dots}>
    {Array.from({ length: count }, (_, index) => (
      <span
        key={index}
        className={index === active ? styles.slider_dots_dot_active : styles.slider_dots_dot}
      />
    ))}
  </div>
);

export default SliderDots;
