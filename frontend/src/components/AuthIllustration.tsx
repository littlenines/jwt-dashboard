import Doughnut from "@/components/Doughnut";
import SliderDots from "@/components/SliderDots";
import styles from "@/styles/components/AuthIllustration.module.scss";

type AuthIllustrationProps = {
  src: string;
  title: string;
  subtitle: string;
  slideCount?: number;
  activeSlide?: number;
};

const AuthIllustration = ({
  src,
  title,
  subtitle,
  slideCount = 3,
  activeSlide = 0,
}: AuthIllustrationProps) => (
  <aside className={styles.auth_illustration}>
    <div className={styles.auth_illustration_media}>
      <img src={src} alt="" />
      <Doughnut />
    </div>

    <div className={styles.auth_illustration_info}>
      <p className={styles.auth_illustration_title}>{title}</p>
      <p className={styles.auth_illustration_subtitle}>{subtitle}</p>
      <SliderDots count={slideCount} active={activeSlide} />
    </div>
  </aside>
);

export default AuthIllustration;
