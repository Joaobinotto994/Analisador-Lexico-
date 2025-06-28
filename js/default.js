class NaoTerminal {
    constructor(key, producao){
        this.key = key;
        this.producao = producao;
    }
}

class Producao{
    constructor(naoTerminal, inicial, producao){
        this.naoTerminal = naoTerminal;
        this.inicial = inicial; // array de símbolos terminais que podem iniciar a produção
        this.producao = producao; // string da produção, ex: "aBb"
    }
}

const epsilon = "ε";

let iteracao = 0;
let pilha = "$S";
let entrada = "";
let finalizou = false;
let producaoGeral = [];
let sentencaDigitada = document.getElementById("sentenca");
let tabela = document.getElementById("resolucao");

$(document).ready(function(){
    $("#sentenca").on("input", function() {
        activateButtons();
    });
    $("#tokenGenerate").on("click", function() {
        activateButtons();
    });

    reset();

    // Cabeçalho da tabela de resolução
    criarCabecalhoTabela();

    // Definindo a gramática com produções curtas tipo S → aBb

    // Regra S
    producaoGeral.push(
        inicializaProducao(
            "S",
            ["a"],
            "aBb"
        )
    );

    // Regra A
    producaoGeral.push(
        inicializaProducao(
            "A",
            ["b"],
            "bCa"
        )
    );
    producaoGeral.push(
        inicializaProducao(
            "A",
            ["c"],
            "c"
        )
    );

    // Regra B
    producaoGeral.push(
        inicializaProducao(
            "B",
            ["b"],
            "bA"
        )
    );
    producaoGeral.push(
        inicializaProducao(
            "B",
            ["c"],
            "c"
        )
    );

    // Regra C
    producaoGeral.push(
        inicializaProducao(
            "C",
            ["a"],
            "a"
        )
    );
    producaoGeral.push(
        inicializaProducao(
            "C",
            ["ε"], // epsilon aqui
            epsilon
        )
    );
});

function inicializaProducao(nTerminal, inicial, producao){
    let regraJaAdicionada = false;
    let naoTerminal;

    for(let i in producaoGeral){
        naoTerminal = producaoGeral[i];
        if (nTerminal == naoTerminal.key) {
            regraJaAdicionada = true;
        }
        if(regraJaAdicionada){
            producaoGeral.splice(i, 1);
            break;
        }
    }

    if(!regraJaAdicionada){
        naoTerminal = new NaoTerminal(nTerminal, []);
    }

    naoTerminal.producao.push(new Producao(naoTerminal, inicial, producao));
    return naoTerminal;
}

function reset(){
    iteracao = 0;
    pilha = "$S";
    entrada = "";
    finalizou = false;

    while(tabela.hasChildNodes()){
        tabela.removeChild(tabela.lastChild);
    }
}

function criarCabecalhoTabela(){
    let header = $("<thead></thead>");
    let row = $("<tr></tr>").appendTo(header);

    row.append($("<th></th>").text(" "));
    row.append($("<th></th>").text("Pilha"));
    row.append($("<th></th>").text("Entrada"));
    row.append($("<th></th>").text("Ação"));

    $("#resolucao").append(header);
}

function geraSentenca(){
    let terminouDeGerar = false;
    let sentenca = "S";
    let nTerminal = "S";
    let steps = 0;

    while(!terminouDeGerar){
        for(let i in producaoGeral){
            let naoTerminal = producaoGeral[i];
            if(naoTerminal.key == nTerminal){
                let rand = Math.floor(Math.random() * naoTerminal.producao.length);
                let prod = naoTerminal.producao[rand];

                if(prod.producao !== epsilon){
                    sentenca = sentenca.replace(nTerminal, prod.producao);
                } else {
                    sentenca = sentenca.replace(nTerminal, '');
                }

                let match = /([A-Z])/g.exec(sentenca);
                if(match == null){
                    terminouDeGerar = true;
                } else {
                    nTerminal = match[0];
                }
            }
        }
        steps++;

        if(steps >= 15){ // aumentei o limite pra garantir a geração
            sentenca = "S";
            nTerminal = "S";
            steps = 0;
        }
    }

    sentencaDigitada.value = sentenca;
    reset();
    criarCabecalhoTabela();
}

function buscaProximaProducao(pilhaChar, entradaChar){
    for(let i in producaoGeral){
        let naoTerminal = producaoGeral[i];
        if(naoTerminal.key == pilhaChar){
            for(let j in naoTerminal.producao){
                let prod = naoTerminal.producao[j];
                if(prod.inicial.includes(entradaChar)){
                    return prod;
                }
            }
        }
    }
    return false;
}

function passoPasso(){
    if(sentencaDigitada.value.length > 0){
        if(finalizou){
            reset();
            criarCabecalhoTabela();
        }

        if(!entrada){
            entrada = sentencaDigitada.value + "$";
        }

        let acaoTomada = "";
        let topoPilha = pilha.slice(-1);
        let pilhaAntes = pilha;
        let entradaAntes = entrada;
        pilha = pilha.slice(0, -1);
        iteracao++;

        if(topoPilha == entrada.charAt(0) && topoPilha == "$"){
            acaoTomada = `Aceito em ${iteracao} iterações`;
            finalizou = true;

            $("#sentence").text($("#sentence").text() + " - Aceito!");
            $("#sentence").css('color', '#344d0e');
            blockButtons();
        }
        else if(topoPilha && topoPilha == topoPilha.toUpperCase()){
            let prod = buscaProximaProducao(topoPilha, entrada.charAt(0));
            if(prod){
                acaoTomada = `${prod.naoTerminal.key} → ${prod.producao}`;
                if(prod.producao !== epsilon){
                    pilha += prod.producao.split('').reverse().join('');
                }
            } else {
                finalizou = true;
                acaoTomada = `Erro em ${iteracao} iterações!`;
                $("#sentence").text($("#sentence").text() + " - Erro!");
                $("#sentence").css('color', 'red');
                blockButtons();
            }
        }
        else if(topoPilha && topoPilha == entrada.charAt(0)){
            acaoTomada = `Lê '${entrada.charAt(0)}'`;
            entrada = entrada.substr(1);
        }
        else{
            finalizou = true;
            acaoTomada = `Erro em ${iteracao} iterações!`;
            $("#sentence").text($("#sentence").text() + " - Erro!");
            $("#sentence").css('color', 'red');
            blockButtons();
        }

        inserirColuna(pilhaAntes, entradaAntes, acaoTomada);
        return acaoTomada;
    }
    else{
        finalizou = true;
    }
}

function resolucaoDireta(){
    let acaoTomada;
    reset();
    criarCabecalhoTabela();

    while(!finalizou){
        acaoTomada = passoPasso();
    }
    alert(acaoTomada);
}

function columnHTML(type, text, cssClass){
    let cell = document.createElement(type);
    cell.className = cssClass || "";
    cell.innerHTML = text;
    return cell;
}

function inserirColuna(pilha, entrada, acaoTomada){
    let row = tabela.insertRow(-1);
    row.appendChild(columnHTML("td", iteracao));
    row.appendChild(columnHTML("td", pilha));
    row.appendChild(columnHTML("td", entrada));
    row.appendChild(columnHTML("td", acaoTomada));
}

function activateButtons(){
    if($("#sentenca").val().trim() != ''){
        $("#passoPasso").prop("disabled", false);
        $("#resolucaoDireta").prop("disabled", false);
        $("#passoPasso").css('display', 'inline-block');
        $("#resolucaoDireta").css('display', 'inline-block');
        $("#passoPasso").css("opacity", "1");
        $("#resolucaoDireta").css("opacity", "1");

        $("#sentence").text($("#sentenca").val());
        $("#sentence").css('color', 'black');
    }
}

function blockButtons(){
    $("#passoPasso").prop("disabled", true);
    $("#resolucaoDireta").prop("disabled", true);
    $("#passoPasso").css("opacity", "0.5");
    $("#resolucaoDireta").css("opacity", "0.5");
}