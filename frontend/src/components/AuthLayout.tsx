import type { ReactNode, SubmitEventHandler } from "react";
import AuthPanel from "@/components/AuthPanel";
import AuthIllustration from "@/components/AuthIllustration";
import styles from "@/styles/components/AuthLayout.module.scss";

type Illustration = {
  src: string;
  title: string;
  subtitle: string;
};

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  onSubmit?: SubmitEventHandler<HTMLFormElement>;
  children: ReactNode;
  footer?: ReactNode;
  illustration: Illustration;
  slideCount?: number;
  activeSlide?: number;
};

const AuthLayout = ({
  title,
  subtitle,
  onSubmit,
  children,
  footer,
  illustration,
  slideCount,
  activeSlide,
}: AuthLayoutProps) => (
  <main className={styles.auth_layout}>
    <AuthPanel title={title} subtitle={subtitle} onSubmit={onSubmit} footer={footer}>
      {children}
    </AuthPanel>

    <AuthIllustration
      src={illustration.src}
      title={illustration.title}
      subtitle={illustration.subtitle}
      slideCount={slideCount}
      activeSlide={activeSlide}
    />
  </main>
);

export default AuthLayout;
