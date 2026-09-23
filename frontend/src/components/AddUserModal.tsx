import { useState } from "react";
import type { SubmitEvent } from "react";
import Modal from "@/components/Modal";
import Field from "@/components/Field";
import Select from "@/components/Select";
import Button from "@/components/Button";
import styles from "@/styles/components/AddUserModal.module.scss";

const roleOptions = [
    { label: "Admin", value: "admin" },
    { label: "Manager", value: "manager" },
    { label: "Staff", value: "staff" },
];

const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Suspended", value: "suspended" },
];

const initialValues = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    status: "active",
};

type AddUserModalProps = {
    onClose: () => void;
};

const AddUserModal = ({ onClose }: AddUserModalProps) => {
    const [values, setValues] = useState(initialValues);

    const setField = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => setValues((current) => ({ ...current, [key]: value }));

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        // TODO: wire up to a real "create user" endpoint
        onClose();
    };

    return (
        <Modal title="Create New User" description="Create a new user account with role and permissions." onClose={onClose}>
            <form className={styles.modal_form} onSubmit={handleSubmit}>
                <Field label="Username" placeholder="johndoe" value={values.username} onChange={(e) => setField("username", e.target.value)} />

                <Field label="Email" type="email" placeholder="john.doe@example.com" value={values.email} onChange={(e) => setField("email", e.target.value)} />

                <Field label="Password" type="password" placeholder="••••••••" value={values.password} onChange={(e) => setField("password", e.target.value)} />
                <Field label="Confirm Password" type="password" placeholder="••••••••" value={values.confirmPassword} onChange={(e) => setField("confirmPassword", e.target.value)} />

                <div className={styles.field_group}>
                    <label>Role</label>
                    <Select className={styles.select_field} options={roleOptions} value={values.role} onChange={(value) => setField("role", value)} placeholder="Select a role" />
                </div>

                <div className={styles.field_group}>
                    <label>Status</label>
                    <Select className={styles.select_field} options={statusOptions} value={values.status} onChange={(value) => setField("status", value)} />
                </div>

                <div className={styles.modal_footer}>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Create User</Button>
                </div>
            </form>
        </Modal>
    )
}

export default AddUserModal
