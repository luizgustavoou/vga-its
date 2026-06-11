# VGA-ITS - Intelligent Tutoring System

Um Sistema Tutor Inteligente (ITS) baseado em Inteligência Artificial, construído com arquitetura de microsserviços. O projeto utiliza IA Generativa (Llama 3 localmente com Ollama) para ensinar conceitos dinâmicos aos alunos com base no domínio do conhecimento (Knowledge Graph).

## Tecnologias

- **Frontend:** Next.js 15 (React), TailwindCSS, TypeScript
- **Backend:** NestJS 11, TypeScript, Mongoose
- **Banco de Dados:** MongoDB
- **Inteligência Artificial:** Ollama (Llama 3 8B)
- **Infraestrutura:** Docker & Docker Compose

---

## 🚀 Pré-requisitos

Para rodar o projeto, você precisa apenas ter instalado em sua máquina:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

---

## ⚙️ Como Rodar o Projeto (CPU)

1. **Inicie os serviços com Docker Compose:**
   Na raiz do projeto (onde está localizado este arquivo), execute:
   ```bash
   docker compose up -d --build
   ```
   *Isso irá construir as imagens do frontend e backend, e subir os contêineres do MongoDB e do Ollama.*

2. **Baixe o Modelo de IA (Llama 3):**
   Como a inteligência artificial roda 100% localmente de forma privada, precisamos baixar o modelo base (aprox. 4.7 GB). Com os contêineres rodando, execute no terminal:
   ```bash
   docker compose exec -d ollama ollama pull llama3
   ```
   *Aguarde alguns minutos dependendo da sua velocidade de internet. O download rodará em background.*

3. **Acessando a Aplicação:**
   - **Frontend (Interface):** [http://localhost:3000](http://localhost:3000)
   - **Backend (API):** [http://localhost:3001/api](http://localhost:3001/api)

   > **Nota:** O banco de dados é populado automaticamente na primeira vez que o backend é iniciado através do script de seed integrado. Não é necessário criar tabelas ou rodar scripts manuais!

---

## ⚡ Acelerando com Placa de Vídeo (NVIDIA GPU)

Se você tiver uma placa de vídeo NVIDIA, é altamente recomendável ativá-la para que as respostas da inteligência artificial sejam instantâneas.

### 1. Instalar o NVIDIA Container Toolkit (Para Linux)
O Docker precisa de um pacote extra para reconhecer sua placa de vídeo:
```bash
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
  && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```
*(Para usuários de Windows usando WSL2 ou Docker Desktop, o suporte a GPU já vem ativado por padrão nas versões recentes).*

### 2. Ativar no docker-compose.yml
Abra o arquivo `docker-compose.yml` e remova o comentário (`#`) da linha `gpus: all` dentro do serviço `ollama`:
```yaml
  ollama:
    # ...
    gpus: all
```

### 3. Reiniciar o ambiente
```bash
docker compose up -d
```

---

## 🛠 Comandos Úteis

- **Ver logs em tempo real (todos):** `docker compose logs -f`
- **Ver logs apenas do Backend:** `docker compose logs -f backend`
- **Derrubar o projeto:** `docker compose down`
- **Derrubar o projeto e resetar o Banco de Dados:** `docker compose down -v`
