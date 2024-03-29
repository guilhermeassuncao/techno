const vm = new Vue({
    el: '#app',
    data: {
        produtos: [],
        produto: false,
        carrinho: [],
        carrinhoAtivo: false,
        alertaMensagem: '',
        alertaAtivo: false,
    },
    computed: {
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
        numeroPreco(numero) {
            return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        },
    },
    methods: {
        fetchProdutos() {
            fetch('./api/produtos.json')
                .then((r) => r.json())
                .then((r) => {
                    this.produtos = r;
                });
        },
        fetchProduto(id) {
            fetch(`./api/produtos/${id}/dados.json`)
                .then((r) => r.json())
                .then((r) => {
                    this.produto = r;
                });
        },
        abrirModal(id) {
            this.fetchProduto(id);
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        },
        fecharModal({ currentTarget, target }) {
            if (currentTarget === target) this.produto = false;
        },
        adicionarCarrinho() {
            this.produto.estoque--;
            const { id, nome, preco } = this.produto;
            this.carrinho.push({ id, nome, preco });
            this.alerta(`${nome} adicionado ao carrinho.`);
        },
        removerCarrinho(index) {
            this.carrinho.splice(index, 1);
        },
        fecharCarrinho({ currentTarget, target }) {
            if (currentTarget === target) this.carrinhoAtivo = false;
        },
        checarLocalStorage() {
            if (window.localStorage.carrinho) this.carrinho = JSON.parse(window.localStorage.carrinho);
        },
        alerta(mensagem) {
            this.alertaMensagem = mensagem;
            this.alertaAtivo = true;
            setTimeout(() => {
                this.alertaAtivo = false;
            }, 1500);
        },
        router() {
            const hash = document.location.hash;
            if (hash) this.fetchProduto(hash.replace('#', ''));
        },
        compararEstoque() {
            const items = this.carrinho.filter(({ id }) => id === this.produto.id);
            this.produto.estoque -= items.length;
        },
    },
    watch: {
        carrinho() {
            window.localStorage.carrinho = JSON.stringify(this.carrinho);
        },
        produto(value) {
            document.title = this.produto.nome || 'Techno';
            const hash = this.produto.id || '';
            history.pushState(null, null, '#' + hash);
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
