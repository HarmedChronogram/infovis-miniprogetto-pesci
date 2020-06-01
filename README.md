# Miniprogetto InfoVis - Pesci

### Live version [here](https://harmedchronogram.github.io/infovis-miniprogetto-pesci/)

* Quando la pagina si carica, si avvia un effetto di landing dove i pesci si posizionano in modo semi-casuale.
* Con il pulsante sinistro si può selezionare una caratteristica dei pesci.
* Quando si passa sopra una caratteristica di un pesce, è indicato in alto a sinistra il valore preciso della variabile assegnata a questa caratteristica di questo pesce.
* Quando una caratteristica è selezionata, i pesci si posizionano in profondità in base ai dati assegnati a questa caratteristica, si posizionano orizzontalmente semi-casualmente (ciascun pesce è assegnato casualmente a une posizione orizzontale predefinita dalle dimensioni della finestra e dei pesci, in modo da minimizzare le sovrapposizioni).
* La visualizzazione funziona con qualunque dataset, dal momento che tutti i data-points hanno almeno cinque variabili quantitative. Il codice è fatto in modo da adattarsi a qualunque nome di variabile.
    * La prima variabile di un data-point sarà assegnata all'altezza del corpo del pesce,
    * la seconda alla lunghezza della pinna caudale,
    * la terza all'altezza della pinna ventrale,
    * la quarta al raggio dell'occhio e
    * la quinta all'altezza della pinna dorsale.
