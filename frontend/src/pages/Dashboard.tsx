import { useState } from "react";
import Navigation from "@/components/Navigation";
import Title from "@/components/Title";
import Button from "@/components/Button";
import Plus from "@/components/icons/Plus";
import UserCountCards from "@/components/UserCountCards";
import UserFilters from "@/components/UserFilters";
import UserTable from "@/components/UserTable";
import AddUserModal from "@/components/AddUserModal";
import { useUserPagination } from "@/hooks/useUserPagination";

const Dashboard = () => {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const {
    data,
    page,
    pageSize,
    search,
    role,
    status,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleRole,
    handleStatus,
  } = useUserPagination();
  
  return (
    <>
      <Navigation />
      <main className="global_layout">
        <Title title="User Management" description="Manage user accounts, roles, and permissions for your shop"  >
          <Button icon={<Plus />} onClick={() => setIsAddUserOpen(true)}>Add User</Button>
        </Title>

        <UserCountCards />

        <UserFilters
          search={search}
          role={role}
          status={status}
          onSearch={handleSearch}
          onRole={handleRole}
          onStatus={handleStatus}
        />

        <UserTable
          data={data}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />

        {isAddUserOpen && <AddUserModal onClose={() => setIsAddUserOpen(false)} />}
      </main>
    </>
  );
};

export default Dashboard;
