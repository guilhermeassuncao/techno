const vm = new Vue({
    el: "#app",
    data: {
        produtos: [],
        produto: false,
        carrinho: [],
        carrinhoAtivo: false,
        alertaMensagem: "",
        alertaAtivo: false,
    },
    computed: {
        //Calcular a quantidade de Itens no Carrinho
        carrinhoTotal() {
            let total = 0;
            if (this.carrinho.length) {
                this.carrinho.forEach((item) => {
                    total += item.preco;
                });
            }
            return total;
        },
    },
    filters: {
        //Numero Float para BRL
        numeroPreco(numero) {
            return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        },
    },
    methods: {
        //Buscar Produtos
        fetchProdutos() {
            fetch("./api/produtos.json")
                .then((r) => r.json())
                .then((r) => {
                    this.produtos = r;
                });
        },
        //Buscar Produto
        fetchProduto(id) {
            fetch(`./api/produtos/${id}/dados.json`)
                .then((r) => r.json())
                .then((r) => {
                    this.produto = r;
                });
        },
        //Abrir Modal
        abrirModal(id) {
            this.fetchProduto(id);
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        },
        //Fechar Modal
        fecharModal({ currentTarget, target }) {
            if (currentTarget === target) this.produto = false;
        },
        //Adicionar Item Carrinho
        adicionarCarrinho() {
            this.produto.estoque--;
            const { id, nome, preco } = this.produto;
            this.carrinho.push({ id, nome, preco });
            this.alerta(`${nome} adicionado ao carrinho.`);
        },
        //Rmover Item Carrinho
        removerCarrinho(index) {
            this.carrinho.splice(index, 1);
        },
        fecharCarrinho({ currentTarget, target }) {
            if (currentTarget === target) this.carrinhoAtivo = false;
        },
        //Checar LocalStorage Carrinho
        checarLocalStorage() {
            if (window.localStorage.carrinho) this.carrinho = JSON.parse(window.localStorage.carrinho);
        },
        // Alerta
        alerta(mensagem) {
            this.alertaMensagem = mensagem;
            this.alertaAtivo = true;
            setTimeout(() => {
                this.alertaAtivo = false;
            }, 1500);
        },
        //Direcionar para paginas internas
        router() {
            const hash = document.location.hash;
            if (hash) this.fetchProduto(hash.replace("#", ""));
        },
        //Verificar Estoque
        compararEstoque() {
            const items = this.carrinho.filter(({ id }) => id === this.produto.id)
            this.produto.estoque -= items.length;
          },
    },
    watch: {
        //Salvar Carrinho no LocalStorage
        carrinho() {
            window.localStorage.carrinho = JSON.stringify(this.carrinho);
        },
        //Obversar mudanças em produto
        produto(value) {
            document.title = this.produto.nome || "Techno";
            const hash = this.produto.id || "";
            history.pushState(null, null, "#" + hash);
            if (value) {
                this.compararEstoque();
            }
        },
    },
    created() {
        this.fetchProdutos();
        this.checarLocalStorage();
        this.router();
    },
});
