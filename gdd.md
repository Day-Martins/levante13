# 🎮 Documento de Design do Jogo (GDD) — Versão Oficial
**Título Oficial:** **Levante 13: A Virada**  
**Gênero:** Arcade / Tiro vertical retrô (*Shoot 'em up inspirado em Space Invaders e Galaga*)  
**Ambientação:** *Space Opera* popular brasileira (Inspirado em *Star Wars* e *Fundação*)  
**Plataforma:** Web (Navegadores em Dispositivos Móveis e Computadores)  
**Público-alvo:** Jogadores casuais, movimentos sociais, coletivos populares e entusiastas de jogos de fliperama  

---

## 1. Visão Geral e Universo Narrativo

### 1.1. O Cenário (*Worldbuilding*)
Quando as forças do Obscurantismo e do Fascismo tentam mergulhar o Brasil em uma era de trevas e servidão — destruindo os direitos dos trabalhadores, queimando as florestas, atacando a ciência, perseguindo a fé do povo e assaltando as instituições democráticas —, a sociedade civil organizada funda o **Levante 13**.

Inspirada nas grandes alianças rebeldes da ficção científica e na preservação civilizatória da *Fundação*, a rede do **Levante 13** une operários, camponeses, povos originários, cientistas e lideranças democráticas em uma luta intergaláctica e popular pela soberania do país.

O jogador assume os controles da **Vanguarda 13**, a principal fragata de combate popular da Resistência, respondendo aos chamados de socorro transmitidos pelos líderes da Aliança.

### 1.2. Pilares de Experiência do Jogador
1. **Ação Arcade Imediata:** Iniciar a partida em menos de 2 segundos, atirando e desviando de frotas inimigas sem telas de espera.
2. **Épico Popular e Humor Satírico:** Elementos de ficção científica clássica mesclados com símbolos marcantes da cultura e da história política brasileira.
3. **Disputa Social de Recordes:** Disputa global no placar do Levante e compartilhamento automático do "Certificado de Resistência" nas redes sociais e no WhatsApp.

---

## 2. Ciclo Principal de Jogabilidade (*Core Gameplay Loop*)

```
[Início da Frente de Batalha] 
       ⬇️
[Holotransmissão da Resistência: Mentor Estrategista em Linha]
       ⬇️
[Combate Espacial: Invasores descem em grade + mergulhos rasantes]
       ⬇️
[Coleta de Artefatos da Fundação: Livro, CTPS, Urna, Vacina, Manto]
       ⬇️
[Confronto Decisivo contra o Chefe Imperial da Frente]
       ⬇️
[Vitória -> Próxima Holotransmissão] OU [Vidas = 0 -> Fim de Jogo & Ranking com Compartilhamento]
```

---

## 3. Mecânicas do Jogador

### 3.1. A Fragata Rebelde (*Vanguarda 13*)
* **Identidade Visual:** Nave estilizada em arte em pixels (*pixel art*) combinando fuselagem aerodinâmica, tons de vermelho vivo, detalhes em verde-amarelo e a estrela da esperança no leme central.
* **Movimentação:** Deslocamento horizontal preciso no eixo X na parte inferior da tela.
* **Pontos de Vigor (Vidas):** O jogador inicia cada incursão com **3 Pontos de Vigor**.
* **Canhão da Resistência (Tiro Padrão):** Disparos verticais contínuos de energia que sobem em linha reta.

### 3.2. Controles
* **Computador (Teclado):**
  * `Setas Esquerda / Direita` ou `A / D`: Manobras laterais da nave.
  * `Barra de Espaço`: Disparo (ou fogo contínuo automático ao manter pressionada).
  * `Enter` ou `Barra de Espaço`: Avança as falas da holotransmissão inicial.
* **Dispositivos Móveis (Telas de Toque):**
  * `Arrastar na base da tela`: Movimentação precisa acompanhando o toque do jogador.
  * `Disparo Automático (*Auto-fire*):` Tiros ativados automaticamente durante a batalha para máxima fluidez em celulares.

---

## 4. Frotas Inimigas e Inteligência Artificial

As frotas invasoras descem em formações de esquadrão sincronizado. Conforme as naves periféricas são destruídas, os motores das unidades restantes aceleram gradativamente.

### 4.1. Classes de Belonaves Inimigas

| Classe | Visual Temático | Comportamento Tático | Pontuação |
| :--- | :--- | :--- | :--- |
| **Drones de Desinformação** | Robôs de notícias falsas (*fake news*), contratos precários | Avançam em blocos compactos disparando projéteis lentos. | 50 pts |
| **Interceptadores Velozes** | Mochilas de aplicativos, balsas poluidoras, megafones de ódio | Rompem a formação e executam **mergulhos rasantes** em direção à Vanguarda 13 (*estilo Galaga*). | 150 pts |
| **Cruzadores Blindados** | Tratores de desmatamento, trituradores de direitos | Absorvem múltiplos impactos (3 a 5 acertos) e disparam projéteis duplos pesados. | 300 pts |
| **Naves Capitânias (Chefes)** | O Algoritmo Central, O Correntão Imperial, A Hidra Golpista | Permanecem no topo da órbita com barra de vida própria e padrões de tiro geométricos. | 2.000 pts |

### 4.2. Padrões Procedurais de Movimentação e Cadência de Batalha

O ritmo de descida foi calibrado para garantir partidas dinâmicas e estratégicas com **duração em torno de 3 minutos (180 segundos)** por fase:

* **Descida Suave Cadenciada:** O passo de descida da grade foi ajustado para 4px por inversão nas bordas, impedindo mortes prematuras nos primeiros segundos e permitindo que a velocidade aumente progressivamente a cada inimigo abatido e a cada 30 segundos de combate.
* **Cronômetro de Missão e Derrota por Time-Out:** Cada setor possui um limite de 180 segundos visível no HUD (`MM:SS`). Caso o tempo se esgote antes da destruição da Capitânia, a missão é interrompida por tempo esgotado.
* **Progressão de Padrões Procedurais:**
  * **Fase 1 (Setor das Redes):** *Clássico (`classic`)* — Movimentação linear cadenciada, começando mais lenta para aprendizado e acelerando progressivamente.
  * **Fase 2 (Setor Fabril):** *Zigue-Zague (`zigzag`)* — Ondas senoidais horizontais e verticais serpenteantes, simulando linhas de montagem instáveis.
  * **Fase 3 (Reserva Planetária):** *Órbitas (`orbit`)* — Rotações circulares e elípticas contínuas em esquadrilha, remetendo a turbilhões na floresta.
  * **Fase 4 (Complexo da Vida):** *Avanço e Recuo (`advance_retreat`)* — Recuo tático lento seguido de súbita investida rápida intimidadora em direção à fragata.
  * **Fase 5 (Santuário da Fé):** *Pinça Lateral (`pincer`)* — Asas laterais que se expandem e fecham em arco ondulante, cercando o jogador com mergulhos táticos.
  * **Fase 6 (Fortaleza Soberana):** *Caos Total (`chaos`)* — Confronto final épico na Esplanada reunindo uma mistura de todos os padrões distribuídos por linha de combate.

---

## 5. Artefatos e Tecnologias da Resistência (*Power-Ups*)

Drones e cruzadores derrotados possuem **8% de chance** de ejetar cápsulas de tecnologia popular:

* 📘 **O Tomo de Freire (Laser Contínuo de Conhecimento):**
  * *Efeito:* Transforma o disparo em um feixe laser perfurante por 8 segundos, dissolvendo esquadrões inteiros em linha reta.
* 🛡️ **O Escudo Protetor CLT:**
  * *Efeito:* Ergue um escudo defletor azul ao redor da nave que absorve **2 impactos diretos** sem perda de vigor.
* 📢 **O Megafone da Mobilização Popular:**
  * *Efeito:* Dispara ondas sonoras e tiros triplos em leque por 10 segundos, cobrindo grande parte do quadrante estelar.
* 🕊️ **O Manto da Diversidade (Defesa do Estado Laico):**
  * *Efeito:* Emite uma onda purificadora que repele projéteis e **desacelera todas as naves inimigas em 50% por 8 segundos**.
* 🗳️ **O Pulso da Urna Soberana (Item Raro da Fundação):**
  * *Efeito:* Soa o clássico aviso sonoro (*"Pilili... Confirma"*) e propaga uma onda de choque que **elimina todos os projéteis e naves básicas da tela** (*limpeza total de tela*).
* 💉 **A Cápsula do SUS (Bio-regeneração):**
  * *Efeito:* Recupera +1 Ponto de Vigor da Vanguarda 13.

---

## 6. As Seis Frentes de Batalha do Levante 13

Cada fase é isolada em sua respectiva pasta (`levels/level_N/`), com seus dados e briefing:

### 📁 Nível 1: Setor das Redes — *O Gabinete do Ódio*
* **Tema:** Guerra da informação, combate aos robôs e à desinformação em massa.
* **Líder da Holotransmissão:** **Ana Elisa** *(Oficial de Contrainteligência e Guerra Digital)*.
* **Cenário:** Fluxos de dados cibernéticos e tempestades de cabos espaciais.
* **Mensagem:** *"Companheiras e companheiros da Vanguarda 13! O Gabinete Imperial está disparando mentiras em massa para cegar a população. Quebrem a criptografia do ódio e defendam a verdade!"*
* **Chefe Imperial:** *O Super-Robô da Mentira*.

### 📁 Nível 2: Setor Fabril — *O Desmonte do Trabalho*
* **Tema:** Combate à uberização, precarização e desmonte dos direitos trabalhistas.
* **Líder da Holotransmissão:** **Jones Manoel** *(Comandante da Frente Operária)*.
* **Cenário:** Estações siderúrgicas abandonadas, linhas de montagem sob fumaça e relógios de ponto em pane.
* **Mensagem:** *"Atenção, camaradas da resistência! O capital financeiro quer transformar a classe trabalhadora em engrenagem descartável. Unam as frotas e mostrem que nenhuma máquina se move sem o trabalhador!"*
* **Chefe Imperial:** *O Algoritmo da Precarização*.

### 📁 Nível 3: Reserva Planetária — *Chamas na Floresta*
* **Tema:** Defesa da Amazônia, preservação da biodiversidade e dos povos originários.
* **Líder da Holotransmissão:** **Guardiã dos Povos da Floresta** *(Liderança Indígena e Socioambiental)*.
* **Cenário:** A Terra vista de cima, com a Amazônia resplandecente sob ataque de chamas e fumaça tóxica.
* **Mensagem:** *"A nossa Terra respira porque os povos tradicionais resistem! Expulsem os invasores, os garimpos ilegais e as motosserras das nossas terras ancestrais!"*
* **Chefe Imperial:** *O Correntão da Devastação*.

### 📁 Nível 4: Complexo da Vida — *O Cerco Negacionista*
* **Tema:** Defesa da ciência, do Sistema Único de Saúde (SUS) e da vida humana.
* **Líder da Holotransmissão:** **Cientista-Chefe da Saúde Popular**.
* **Cenário:** Laboratórios de pesquisa orbital cercados por nuvens tóxicas e obscurantismo.
* **Mensagem:** *"Eles tentaram sabotar a imunização e asfixiar a ciência pública. Provem que o saber e o cuidado coletivo são as maiores forças da civilização!"*
* **Chefe Imperial:** *A Quimera do Obscurantismo*.

### 📁 Nível 5: O Santuário da Fé — *O Cerco Fundamentalista*
* **Tema:** Defesa irrestrita da liberdade religiosa, respeito aos terreiros e Estado Laico.
* **Líder da Holotransmissão:** **Pastor Henrique Vieira** *(Emissário da Liberdade Espiritual)*.
* **Cenário:** Templos históricos, sinagogas e terreiros tradicionais sob cerco de tochas inquisitórias.
* **Mensagem:** *"Companheiras e companheiros! O verdadeiro amor e a fé popular erguem pontes de comunhão, nunca fogueiras de intolerância. Vamos defender o sagrado direito de cada ser humano crer com dignidade e paz!"*
* **Chefe Imperial:** *O Falso Profeta do Ódio*.

### 📁 Nível 6: A Fortaleza Soberana — *A Esplanada da Democracia*
* **Tema:** O grande confronto final em defesa da soberania nacional na Praça dos Três Poderes.
* **Líder da Holotransmissão:** **Lula** *(Líder Histórico da Aliança / Presidente)*.
* **Cenário:** A Praça dos Três Poderes e o Congresso Nacional sob uma cúpula de luz estelar protegida pelo povo.
* **Mensagem:** *"Queridas companheiras e queridos companheiros da Vanguarda 13: este país pertence a cada uma das 215 milhões de brasileiras e brasileiros. A democracia é o nosso bem mais precioso. Vamos juntos vencer o fascismo e reconstruir a esperança!"*
* **Chefe Imperial Supremo:** *A Hidra Golpista*.

---

## 7. Interface e Experiência do Usuário (UI / HUD)

### 7.1. Interface de Batalha (HUD)
* **Canto Superior Esquerdo:** `VIGOR:` ❤️ ❤️ ❤️ (Pontos restantes da Vanguarda 13).
* **Centro Superior:** `FRENTE ATIVA:` Nome do setor em disputa.
* **Canto Superior Direito:** `PONTOS DE RESISTÊNCIA:` Pontuação acumulada.
* **Base da Tela:** Linha de órbita delimitada para manobras da fragata.

### 7.2. Tela de Holotransmissão (*Codec Sci-Fi*)
* Borda tecnológica com linhas de varredura holográfica azul e estática retrô.
* Retrato em arte em pixels do líder da Aliança com feixes holográficos (`mentor.png`).
* Texto datilografado em tempo real (*typewriter effect*) com sintetizador de teletipo em 8 bits.
* Tecla `[ESPAÇO]` ou toque no painel para iniciar o combate estelar.

### 7.3. Tela de Fim de Missão e Placar do Levante
* Informação da pontuação final e medalha de honra da Resistência.
* Entrada para a **Arcade Tag** do piloto (3 a 12 caracteres, ex.: `PILOTO_13`, `REBELDE_SP`).
* Selo de privacidade e conformidade com a LGPD: *"Utilize um codinome fictício. Nenhum dado pessoal é exigido."*
* Botão **[ENVIAR PARA O COMANDO DO LEVANTE]**:
  * Carregamento do TOP 10 dos melhores pilotos da galáxia.
  * Pré-visualização do "Certificado de Resistência" gerado via PHP GD.
  * Botão de alta conversão: **[CONVOCAR NO WHATSAPP COM 1 TOQUE]**.

---

## 8. Identidade Sonora e Visual (*Game Juice*)

* **Visual:**
  * Tremor de tela (*screen shake*) nas colisões de impacto e explosões de chefes.
  * Feixes de laser coloridos com brilho suave e partículas de fragmentação metálica.
  * Filtro opcional de linhas de fósforo verde/âmbar e linhas de varredura CRT.
* **Áudio:**
  * Efeitos sonoros espaciais em síntese FM e 8 bits clássicos.
  * Áudio da urna eletrônica (*"Pilili... Confirma"*) com reverberação épica ao acionar o pulso democrático.
  * Hinos populares e temas marcantes arranjados em *chiptune* orquestrado espacial.
