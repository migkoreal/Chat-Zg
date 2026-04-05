// ===== Variáveis globais =====
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let mensagens = []; // Armazena mensagens globais
let bots = []; // Bots automáticos
let servidores = []; // Servidores criados
let silenciados = []; // Usuários silenciados

// ===== Funções de Popup =====
function abrirPopup(msg){
    const popup = document.getElementById('popup');
    popup.style.display = 'flex';
    popup.querySelector('p').innerHTML = msg;
}
function fecharPopup(){
    document.getElementById('popup').style.display = 'none';
}

// ===== Atualiza interface =====
function atualizarInterface(){
    if(!currentUser) return;

    // Lista de amigos e servidores
    const friendList = document.getElementById('friendList');
    const serverList = document.getElementById('serverList');
    friendList.innerHTML = '';
    serverList.innerHTML = '';

    currentUser.amigos.forEach(f => {
        const div = document.createElement('div');
        div.className = 'friend-item';
        div.innerText = f;
        friendList.appendChild(div);
    });

    servidores.forEach(s => {
        const div = document.createElement('div');
        div.className = 'server-item';
        div.innerText = s.nome;
        serverList.appendChild(div);
    });

    atualizarStatus();
    atualizarChat();
}

// ===== Atualiza chat =====
function atualizarChat(){
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.innerHTML = '';

    mensagens.forEach(msg=>{
        if(silenciados.includes(msg.author)) return; // ignora mensagens silenciadas
        const div = document.createElement('div');
        div.className = 'message';
        div.innerHTML = `<span class="author">${msg.author}:</span> ${msg.text}`;
        chatWindow.appendChild(div);
    });

    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ===== Enviar mensagem =====
function enviarMensagem(){
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    // Comandos
    if (text.startsWith('/')){
        executarComando(text);
        input.value = '';
        return;
    }

    // Verifica se usuário está silenciado
    if(silenciados.includes(currentUser.nomeExibido)){
        abrirPopup("Você está silenciado e não pode enviar mensagens!");
        input.value = '';
        return;
    }

    mensagens.push({author: currentUser.nomeExibido, text: text});
    atualizarChat();
    input.value = '';

    // Bots automáticos
    bots.forEach(bot=>{
        if (text.includes(bot.trigger)){
            mensagens.push({author: bot.nome, text: bot.response});
        }
    });
}

// ===== Comandos =====
function executarComando(cmd){
    if (cmd === '/limpar'){
        document.getElementById('chatInput').value = '';
        abrirPopup('Caixa de comandos limpa!');
    }
    else if (cmd.startsWith('/bot')){
        const partes = cmd.split(' ');
        if (partes.length < 3){
            abrirPopup('Use: /bot nome trigger response');
            return;
        }
        const botNome = partes[1];
        const trigger = partes[2];
        const response = partes.slice(3).join(' ');
        bots.push({nome: botNome, trigger: trigger, response: response});
        abrirPopup(`Bot ${botNome} criado!`);
    }
    else if (cmd.startsWith('/status')){
        const status = cmd.slice(8);
        currentUser.status = status;
        atualizarStatus();
        abrirPopup('Status atualizado!');
    }
    else if (cmd.startsWith('/admin')){
        if (!currentUser.isAdmin){
            abrirPopup('Você não tem permissão!');
            return;
        }
        abrirPainelAdmin();
    }
    else if(cmd.startsWith('/silenciar')){
        if(!currentUser.isAdmin) return;
        const usuario = cmd.split(' ')[1];
        if(usuario && !silenciados.includes(usuario)){
            silenciados.push(usuario);
            abrirPopup(`Usuário ${usuario} silenciado!`);
        }
    }
    else if(cmd.startsWith('/liberar')){
        if(!currentUser.isAdmin) return;
        const usuario = cmd.split(' ')[1];
        const index = silenciados.indexOf(usuario);
        if(index !== -1){
            silenciados.splice(index,1);
            abrirPopup(`Usuário ${usuario} liberado!`);
        }
    }
    else if(cmd.startsWith('/server')){
        if(!currentUser.isAdmin) return;
        const nomeServer = cmd.split(' ')[1];
        if(nomeServer) servidores.push({nome: nomeServer, membros: []});
        abrirPopup(`Servidor ${nomeServer} criado!`);
    }
    else{
        abrirPopup('Comando inválido!');
    }
    atualizarInterface();
}

// ===== Atualizar status =====
function atualizarStatus(){
    const container = document.getElementById('statusContainer');
    container.innerHTML = currentUser.status || 'Sem status';
}

// ===== Upload =====
function abrirUpload(){
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,video/*';
    fileInput.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        mensagens.push({author: currentUser.nomeExibido, text: `[Arquivo enviado: ${file.name}]`});
        atualizarChat();
    };
    fileInput.click();
}

// ===== Emoji =====
function abrirEmoji(){
    const emojis = ['😀','😂','😎','😍','😭','🤯','😡','👍','👎','💖'];
    const emoji = emojis[Math.floor(Math.random()*emojis.length)];
    const input = document.getElementById('chatInput');
    input.value += emoji;
}

// ===== Painel admin avançado =====
function abrirPainelAdmin(){
    const listaUsuarios = usuarios.map(u=>u.nomeExibido).join('<br>');
    const listaBots = bots.map(b=>b.nome).join('<br>');
    const listaSilenciados = silenciados.join('<br>');
    const listaServidores = servidores.map(s=>s.nome).join('<br>');
    const msg = `
    <b>ADMIN PAINEL:</b><br>
    <u>Usuários:</u><br>${listaUsuarios || 'Nenhum'}<br>
    <u>Bots:</u><br>${listaBots || 'Nenhum'}<br>
    <u>Silenciados:</u><br>${listaSilenciados || 'Nenhum'}<br>
    <u>Servidores:</u><br>${listaServidores || 'Nenhum'}<br>
    <br>Comandos disponíveis:<br>
    /silenciar @usuario<br>
    /liberar @usuario<br>
    /server nomeServidor<br>
    /admin (abre painel)<br>
    `;
    abrirPopup(msg);
}
