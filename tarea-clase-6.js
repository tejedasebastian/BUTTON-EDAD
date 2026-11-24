/*
TAREA: Empezar preguntando cuánta gente hay en el grupo familiar.
Crear tantos inputs+labels como gente haya para completar la edad de cada integrante.
Al hacer click en "calcular", mostrar en un elemento pre-existente la mayor edad, la menor edad y el promedio del grupo familiar.

Punto bonus: Crear un botón para "empezar de nuevo" que empiece el proceso nuevamente, borrando los inputs ya creados.
*/

(() => {
    'use strict';

    const MAX_INTEGRANTES = 50;

    const formCantidad = document.querySelector('#form-cantidad');
    const cantidadInput = document.querySelector('#cantidad-integrantes');
    const integrantesContenedor = document.querySelector('#integrantes');
    const botonCalcular = document.querySelector('#calcular');
    const botonReiniciar = document.querySelector('#reiniciar');
    const errorCantidad = document.querySelector('#errorCantidad');
    const errorEdad = document.querySelector('#errorEdad');
    const datosCalculados = document.querySelector('#datosCalculados');
    const promedioSalida = document.querySelector('#promedio-edad');
    const mayorSalida = document.querySelector('#mayor-edad');
    const menorSalida = document.querySelector('#menor-edad');

    function mostrar(elemento) {
        elemento.classList.remove('oculto');
    }

    function ocultar(elemento) {
        elemento.classList.add('oculto');
    }

    function marcarError(input, tieneError) {
        input.classList.toggle('error', tieneError);
        input.setAttribute('aria-invalid', String(tieneError));
    }

    function crearIntegrantes(cantidad) {
        const fragmento = document.createDocumentFragment();

        for (let i = 1; i <= cantidad; i += 1) {
            const fila = document.createElement('div');
            fila.className = 'integrante';

            const etiqueta = document.createElement('label');
            etiqueta.className = 'textoEdad';
            etiqueta.htmlFor = `edad-integrante-${i}`;
            etiqueta.textContent = `Ingrese la edad del integrante ${i}`;

            const entrada = document.createElement('input');
            entrada.type = 'number';
            entrada.className = 'edadIntegrante';
            entrada.id = `edad-integrante-${i}`;
            entrada.name = `edad-integrante-${i}`;
            entrada.min = '1';
            entrada.step = '1';
            entrada.inputMode = 'numeric';
            entrada.autocomplete = 'off';
            entrada.setAttribute('aria-describedby', 'errorEdad');

            fila.append(etiqueta, entrada);
            fragmento.append(fila);
        }

        integrantesContenedor.replaceChildren(fragmento);
    }

    function borrarIntegrantes() {
        integrantesContenedor.replaceChildren();
    }

    function obtenerEntradasEdad() {
        return [...integrantesContenedor.querySelectorAll('.edadIntegrante')];
    }

    function limpiarResultados() {
        promedioSalida.textContent = '';
        mayorSalida.textContent = '';
        menorSalida.textContent = '';
        ocultar(datosCalculados);
    }

    function validarCantidad() {
        const valor = cantidadInput.value.trim();
        const cantidad = Number(valor);
        const valida = valor !== ''
            && Number.isInteger(cantidad)
            && cantidad > 0
            && cantidad <= MAX_INTEGRANTES;

        marcarError(cantidadInput, !valida);
        return { valida, cantidad };
    }

    function validarEdades() {
        const edades = [];
        const entradasInvalidas = [];
        const entradas = obtenerEntradasEdad();

        entradas.forEach((entrada) => {
            const valor = entrada.value.trim();
            const edad = Number(valor);
            const valida = valor !== '' && Number.isFinite(edad) && edad > 0;

            marcarError(entrada, !valida);

            if (valida) {
                edades.push(edad);
            } else {
                entradasInvalidas.push(entrada);
            }
        });

        return {
            edades,
            entradasInvalidas,
            valida: entradas.length > 0 && entradasInvalidas.length === 0,
        };
    }

    function actualizarResultados(edades) {
        promedioSalida.textContent = obtenerPromedio(edades);
        mayorSalida.textContent = String(obtenerMayorNumero(edades));
        menorSalida.textContent = String(obtenerMenorNumero(edades));
    }

    function reiniciar() {
        formCantidad.reset();
        borrarIntegrantes();
        limpiarResultados();
        ocultar(botonCalcular);
        ocultar(errorCantidad);
        ocultar(errorEdad);
        marcarError(cantidadInput, false);
        cantidadInput.focus();
    }

    formCantidad.addEventListener('submit', (event) => {
        event.preventDefault();

        const { valida, cantidad } = validarCantidad();

        borrarIntegrantes();
        limpiarResultados();
        ocultar(errorEdad);

        if (!valida) {
            ocultar(botonCalcular);
            mostrar(errorCantidad);
            cantidadInput.focus();
            return;
        }

        ocultar(errorCantidad);
        crearIntegrantes(cantidad);
        mostrar(botonCalcular);

        const primeraEntrada = obtenerEntradasEdad()[0];
        if (primeraEntrada) {
            primeraEntrada.focus();
        }
    });

    botonCalcular.addEventListener('click', () => {
        const { edades, entradasInvalidas, valida } = validarEdades();

        if (!valida) {
            limpiarResultados();
            mostrar(errorEdad);

            if (entradasInvalidas.length > 0) {
                entradasInvalidas[0].focus();
            }
            return;
        }

        ocultar(errorEdad);
        actualizarResultados(edades);
        mostrar(datosCalculados);
    });

    botonReiniciar.addEventListener('click', reiniciar);
})();
