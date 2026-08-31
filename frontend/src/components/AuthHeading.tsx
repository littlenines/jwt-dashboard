import styles from "@/styles/components/AuthHeading.module.scss";

type AuthHeadingProps = {
  title: string;
  subtitle: string;
};

const AuthHeading = ({ title, subtitle }: AuthHeadingProps) => (
  <>
    <h1 className={styles.auth_heading_title}>{title}</h1>
    <p className={styles.auth_heading_subtitle}>{subtitle}</p>
  </>
);

export default AuthHeading;
