import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IUsersListingResponse } from "@/types";

function DashboardTable({
  usersListing,
}: {
  usersListing: IUsersListingResponse | null;
}) {
  const users = usersListing?.response?.data?.map((user) => {
    return {
      id: user.id,
      name: user.name,
      joinedOn: user.created_at?.toString(),
    };
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Joined On</TableHead>
          <TableHead>Verified</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users?.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.joinedOn}</TableCell>
           
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default DashboardTable;
