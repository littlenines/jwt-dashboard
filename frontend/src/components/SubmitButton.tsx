import { memo } from "react";
import styles from "@/styles/components/SubmitButton.module.scss";

const SubmitButton = ({ children, ...props }) => {
  return (
    <button className={ styles.submit_button} type="submit" {...props}>{ children }</button>
  )
}

export default memo(SubmitButton);
