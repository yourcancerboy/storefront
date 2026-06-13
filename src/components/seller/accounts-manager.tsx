import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Plus, UserCog } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  FINANCE: "Finance",
  OPERATIONS: "Operasional",
  CUSTOMER_SERVICE: "Customer Service",
};

const ROLE_PERMISSIONS_SUMMARY: Record<string, string> = {
  SUPER_ADMIN: "Akses penuh",
  FINANCE: "Pesanan, laporan keuangan",
  OPERATIONS: "Produk, pengiriman, promosi",
  CUSTOMER_SERVICE: "Lihat pesanan & pengiriman (no edit)",
};

export async function AccountsManager() {
  const staffAccounts = await prisma.user.findMany({
    where: { role: { not: "BUYER" } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Akun</h1>
          <p className="text-sm text-muted-foreground">{staffAccounts.length} akun staff</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />Tambah Akun
        </Button>
      </div>

      {/* Role legend */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(ROLE_LABELS).map(([role, label]) => (
          <div key={role} className="border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-semibold">{label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{ROLE_PERMISSIONS_SUMMARY[role]}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Belum ada akun staff
                </TableCell>
              </TableRow>
            ) : (
              staffAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                        {account.name?.[0]?.toUpperCase() || account.email[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{account.name || "Tanpa Nama"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{account.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{ROLE_LABELS[account.role] || account.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.isActive ? "success" : "destructive"} className="text-xs">
                      {account.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(account.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-xs">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
