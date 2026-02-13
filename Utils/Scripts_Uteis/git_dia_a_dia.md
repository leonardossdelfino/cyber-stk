# Fluxo do dia a dia
# Depois de configurado, o uso diário é simples. Toda vez que fizer mudanças significativas:

# 1. Ver o que mudou
git status

# 2. Adicionar as mudanças
git add .

# 3. Descrever o que foi feito
git commit -m "feat: adiciona página de listagem de OCs"

# 4. Enviar para o GitHub
git push

---------------------------------------------------------------------------------------------------

# Boas mensagens de commit
# Uma boa prática é usar prefixos nas mensagens para identificar o tipo de mudança:

git commit -m "feat: nova funcionalidade"      # algo novo
git commit -m "fix: corrige bug no formulário" # correção de bug
git commit -m "style: ajusta cores do menu"    # mudança visual
git commit -m "docs: atualiza comentários"     # documentação

---------------------------------------------------------------------------------------------------

# Em uma máquina nova
# Quando quiser continuar em outro computador, é só um comando:
