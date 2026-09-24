import Modal from "@/components/Modal";
import Field from "@/components/Field";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { useAddUser } from "@/hooks/useAddUser";
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

type AddUserModalProps = {
    onClose: () => void;
};

const AddUserModal = ({ onClose }: AddUserModalProps) => {
    const { values, setField, error, pending, submit } = useAddUser(onClose);

    return (
        <Modal title="Create New User" description="Create a new user account with role and permissions." onClose={onClose}>
            <form className={styles.modal_form} onSubmit={submit}>
                <Field label="Username" placeholder="johndoe" value={values.username} onChange={(e) => setField("username", e.target.value)} />

                <Field label="Email" type="email" placeholder="john.doe@example.com" value={values.email} onChange={(e) => setField("email", e.target.value)} />

                <Field label="Password" type="password" placeholder="••••••••" value={values.password} onChange={(e) => setField("password", e.target.value)} />
                <Field label="Confirm Password" type="password" placeholder="••••••••" value={values.confirmPassword} onChange={(e) => setField("confirmPassword", e.target.value)} />

                <div className={styles.field_group}>
                    <label>Role</label>
                    <Select className={styles.select_field} options={roleOptions} value={values.role} onChange={(value) => setField("role", value as typeof values.role)} placeholder="Select a role" />
                </div>

                <div className={styles.field_group}>
                    <label>Status</label>
                    <Select className={styles.select_field} options={statusOptions} value={values.status} onChange={(value) => setField("status", value as typeof values.status)} />
                </div>

                {error && <p role="alert">{error}</p>}

                <div className={styles.modal_footer}>
                    <Button variant="secondary" onClick={onClose} disabled={pending}>Cancel</Button>
                    <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create User"}</Button>
                </div>
            </form>
        </Modal>
    )
}

export default AddUserModal
