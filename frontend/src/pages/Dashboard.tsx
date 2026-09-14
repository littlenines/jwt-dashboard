import Navigation from "@/components/Navigation";
import Title from "@/components/Title";
import Button from "@/components/Button";
import Plus from "@/components/icons/Plus";
import UserCountCards from "@/components/UserCountCards";

const Dashboard = () => {

  return (
    <>
      <Navigation />
      <main className="global_layout">
        <Title title="User Management" description="Manage user accounts, roles, and permissions for your shop"  >
          <Button icon={<Plus />}>Add User</Button>
        </Title>

        <UserCountCards />

        
      </main>
    </>
  );
};

export default Dashboard;
