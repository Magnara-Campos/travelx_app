import React, { useState, useEffect } from 'react';
import { userProfileService } from '../../services/perfil';

interface ProfileData {
  name: string;
  sobrenome: string;
  telefone: string;
  data_nascimento: string;
  genero: string;
}

const UserProfileModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    sobrenome: '',
    telefone: '',
    data_nascimento: '',
    genero: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch profile data when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userProfileService.getProfile();
        setProfile(data);
      } catch (err) {
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Basic validation
    if (!profile.name || !profile.sobrenome || !profile.telefone || !profile.data_nascimento || !profile.genero) {
      setError('Todos os campos são obrigatórios');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await userProfileService.updateProfile(profile);
      setIsOpen(false); // Close modal on success
    } catch (err) {
      setError('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Edit Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Editar Perfil
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Editar Perfil</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Nome</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Sobrenome</label>
                  <input
                    type="text"
                    name="sobrenome"
                    value={profile.sobrenome}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Telefone</label>
                  <input
                    type="tel"
                    name="telefone"
                    value={profile.telefone}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Data de Nascimento</label>
                  <input
                    type="date"
                    name="data_nascimento"
                    value={profile.data_nascimento}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Gênero</label>
                  <select
                    name="genero"
                    value={profile.genero}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileModal;