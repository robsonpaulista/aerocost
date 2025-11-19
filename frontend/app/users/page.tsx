'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, User as UserIcon, Shield, UserCheck, UserX, Mail, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, type User } from '@/lib/api';
import { Select } from '@/components/ui/Select';

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user',
    is_active: true,
  });

  useEffect(() => {
    // Verifica se é admin
    if (currentUser?.role !== 'admin') {
      router.push('/');
      return;
    }
    loadUsers();
  }, [currentUser, router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.list();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      alert('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        is_active: user.is_active,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      is_active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Atualizar
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await userApi.update(editingUser.id, updateData);
      } else {
        // Criar
        if (!formData.password) {
          alert('Senha é obrigatória para novos usuários');
          return;
        }
        await userApi.create(formData);
      }
      handleCloseModal();
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      alert(error.response?.data?.error || 'Erro ao salvar usuário');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este usuário?')) {
      return;
    }
    try {
      await userApi.delete(id);
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao desativar usuário:', error);
      alert(error.response?.data?.error || 'Erro ao desativar usuário');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await userApi.update(user.id, { is_active: !user.is_active });
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      alert(error.response?.data?.error || 'Erro ao alterar status');
    }
  };

  if (currentUser?.role !== 'admin') {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">Gerenciar Usuários</h1>
            <p className="text-sm text-text-light mt-1">
              Gerencie os usuários do sistema
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            icon={<Plus className="w-4 h-4" />}
          >
            Novo Usuário
          </Button>
        </div>

        {/* Lista de Usuários */}
        {loading ? (
          <Card className="text-center py-12">
            <p className="text-text-light">Carregando usuários...</p>
          </Card>
        ) : users.length === 0 ? (
          <Card className="text-center py-12">
            <UserIcon className="w-16 h-16 text-text-light mx-auto mb-4" />
            <h3 className="text-base font-semibold text-text mb-2">
              Nenhum usuário cadastrado
            </h3>
            <p className="text-text-light mb-6">
              Comece criando o primeiro usuário do sistema.
            </p>
            <Button onClick={() => handleOpenModal()} icon={<Plus className="w-4 h-4" />}>
              Criar Primeiro Usuário
            </Button>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-text">Nome</th>
                    <th className="text-left py-3 px-4 font-semibold text-text">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-text">Papel</th>
                    <th className="text-left py-3 px-4 font-semibold text-text">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-text">Último Login</th>
                    <th className="text-right py-3 px-4 font-semibold text-text">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-text-light" />
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-text-light" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role === 'admin' ? (
                            <>
                              <Shield className="w-3 h-3" />
                              Administrador
                            </>
                          ) : (
                            <>
                              <UserIcon className="w-3 h-3" />
                              Usuário
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            user.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3" />
                              Inativo
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        {user.last_login ? (
                          <div className="flex items-center gap-1 text-text-light">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">
                              {new Date(user.last_login).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-text-light text-xs">Nunca</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-all duration-150"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-150"
                              title="Desativar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Modal de Criar/Editar */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-text mb-4">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    type="email"
                    label="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <Input
                    type="password"
                    label={editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                  />
                  <Select
                    label="Papel"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                    options={[
                      { value: 'user', label: 'Usuário' },
                      { value: 'admin', label: 'Administrador' },
                    ]}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="text-sm text-text">
                      Usuário ativo
                    </label>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                      {editingUser ? 'Salvar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

