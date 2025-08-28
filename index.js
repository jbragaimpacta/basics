function Pessoa(altura, peso) {
    if (!altura || !peso) {
        throw new Error("Altura e peso são obrigatórios");
    }
    this.altura = altura;
    this.peso = peso;
}

function Nutricionista(altura, peso) {
    Pessoa.call(this, altura, peso);

    this.calculaImc = function (callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:3000/imc/calculate", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                callback(response.imc);
            }
        };
        xhr.send(JSON.stringify({ height: this.altura, weight: this.peso }));
    };

    this.classificaIMC = function (imc) {
        if (imc < 18.5) {
            return "Abaixo do peso";
        }
        if (imc >= 18.5 && imc < 24.9) {
            return "Peso normal";
        }
        if (imc >= 25 && imc < 29.9) {
            return "Sobrepeso";
        }
        return "Obesidade";
    };
}
Nutricionista.prototype = Object.create(Pessoa.prototype);
Nutricionista.prototype.constructor = Nutricionista;

function renderizaTabelaIMC(imc) {
    var intervalos = [
        { min: 0, max: 18.4, classificacao: "Abaixo do peso" },
        { min: 18.4, max: 24.9, classificacao: "Peso normal" },
        { min: 24.9, max: 29.9, classificacao: "Sobrepeso" },
        { min: 29.9, max: Infinity, classificacao: "Obesidade" }
    ];

    var html = "<table id='tabela-imc'><thead><tr><th>Classifica&ccedil;&atilde;o</th><th>IMC</th></tr></thead><tbody>";
    intervalos.forEach(function(x) {
        var row = "<tr class='destaque-imc-placeholder'><td>{{classificacao}}</td><td>{{intervalo}}</td></tr>"
        var intervalo = x.min + " - " + x.max;
        if (imc >= x.min && imc < x.max) row = row.replace("destaque-imc-placeholder", "destaque-imc");
        html += row.replace("{{intervalo}}", intervalo).replace("{{classificacao}}", x.classificacao);
    });
    html += "</tbody></table>";
    document.getElementById("tabela-imc-container").innerHTML = html;
}

function renderizaResultadoIMC(nutricionista, imc) {
    document.getElementById("imc").innerText =
        imc + " - " + nutricionista.classificaIMC(imc);
    renderizaTabelaIMC(imc);
}

function actionCalcularIMCBuilder() {
    var alturaEl = document.getElementById("altura");
    var pesoEl = document.getElementById("peso");

    return function actionCalcularIMC(evt) {
        evt.preventDefault();

        var nutricionista = new Nutricionista(
            parseFloat(alturaEl.value),
            parseFloat(pesoEl.value)
        );

        nutricionista.calculaImc(function(imc) {
            renderizaResultadoIMC(nutricionista, imc);
        });
    }
}

window.onload = function () {
    document
        .getElementById("calcular")
        .addEventListener("click", actionCalcularIMCBuilder());
};