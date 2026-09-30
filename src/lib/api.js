const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function buscarPerfil(token) {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      console.error('Erro ao carregar perfil:', await response.text());
      return null;
    }

    const { usuario } = await response.json();
    return usuario;
  } catch (erro) {
    console.error('Erro ao acessar o backend:', erro);
    return null;
  }
}
