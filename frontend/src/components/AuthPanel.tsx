import type { ReactNode, SubmitEventHandler } from "react";
import AuthHeading from "@/components/AuthHeading";
import styles from "@/styles/components/AuthPanel.module.scss";

type AuthPanelProps = {
  title: string;
  subtitle: string;
  onSubmit?: SubmitEventHandler<HTMLFormElement>;
  children: ReactNode;
  footer?: ReactNode;
};

const AuthPanel = ({ title, subtitle, onSubmit, children, footer }: AuthPanelProps) => (
  <section>
    <div className={styles.auth_panel}>
      <AuthHeading title={title} subtitle={subtitle} />

      <form className={styles.auth_panel_form} onSubmit={onSubmit}>
        {children}
      </form>

      {footer && <p className={styles.auth_panel_footer}>{footer}</p>}
    </div>
  </section>
);

export default AuthPanel;
