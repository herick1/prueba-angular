import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: "app-onepage",
  templateUrl: "./onepage.component.html",
  styleUrls: ["./onepage.component.css"]
})

export class OnepageComponent implements OnInit {

  //esto es para guardas las solicitudes
  player={
    status,
    message:{}
  }

  //variable con todas las partidas en el front 
  partidas = []

  // estos son los datos que tendra angular 
  //aqui esta la informacion del jugador 
  jugadores = []

  jugador = {
     name:"Invitado",
     numeroplayer: -1,
     //port:8080,
     url:"localhost"
  }

  //desabilita algun boton cuando se esta ejecutando una peticion
  public deshabilitar: any = 0;

  public identificador: any = [];

  //variable encargada de mostrar en pantalla las fichas en juego
  fichasTablero = "";

  //variable encargada de mostrar en pantalla las fichas de tu mano
  fichasTuyas = "";

  //esta variables es utilizada ya que al visualizar la partida debemos tomar es id para 
  //despues mandarla cuando estas jugando en la partida
  visualizarID= -1;

  //para decirlee al usuario que no es parte de esa partida
  errorVisualizar = ""

  //bandera para cuando se haga pro primera vez el registrarme, ya que no es necesario hacer solicitudes 
  //http si no se a registrado el carajo
  Selogio = false;

  constructor(private http: HttpClient) {  
  }

  ngOnInit(
  ) {
   this.timeout()
  }

  timeout() {
    setTimeout(() => {
        console.log('Esto se ejecuta siempre');
        this.getJugador()
        this.getPartidas()
        this.visualizartablerodeJugada()
        this.timeout();
    }, 800);
  }

  //Este metodo es para preguntar a cada rato al servidor ¿quien soy? 
  getJugador() {
    if(this.Selogio){
      this.http.get("https://"+ this.jugador.url+"/jugador").subscribe( 
        (response: any)=>{    
          this.jugador = response.message;
          this.jugadores[0] =  response.message;
          console.log(this.jugador)
        }
      );
    }
  }

  //Este metodo es para preguntar a cada rato las partidas
  getPartidas() {
    if(this.Selogio){
      this.http.get("https://"+ this.jugador.url +"/partidas").subscribe( 
        (response: any)=>{
          this.player.status = response.status;
          this.partidas = response.message;
      });
    }
  }

  registrar(ip, nombre) {
     this.jugador.name=nombre;
    let body ={    
                name:nombre,
                url:ip
              }
    this.http.post("https://"+ ip +"/registrarusuario", body).subscribe( 
        (response: any)=>{
          this.player.status = response.status;
          this.partidas = response.message;
      });
  }

  //metodo utilizado para hacer el registro del usuario
  //ya funciona el post de registrarme
  registrarme(ip, nombre, ipNewplayer){
    this.registrar(ip, nombre);
    if(ipNewplayer != "" ){
        let newplayer ={ "newplayer": {     
                          name:nombre,
                          numeroplayer:1,
                          //port: this.jugador.port,
                          url:ip
                        }
                      }
        this.http.post("https://"+ ipNewplayer +"/newplayer", newplayer)
        .subscribe( 
            (response: any)=>{
              this.player.status = response.status;
              this.partidas = response.message;
          });
    }
    this.jugador.url= ip;
    this.Selogio = true; 
  }


  //este lo tulizamos cuando le damos click en la tabla a alguno elemento
  visualizarPartida(id){
    for(var i=0; i< this.partidas.length;i++){
        if(this.partidas[i].id == id){
           if((this.partidas[i].jugador1.ip  == this.jugador.url)||
             (this.partidas[i].jugador2.ip  == this.jugador.url))
             {                
                this.fichasTablero ="" 
                for(var j = 0; j<this.partidas[i].fichas_jugadas.length;j++){ 
                      this.fichasTablero +=    " "  +  this.partidas[i].fichas_jugadas[j]+ "  "; 
                }
                if((this.partidas[i].jugador1.ip  == this.jugador.url)){                   
                      this.fichasTuyas ="" 
                      for(var j = 0; j<this.partidas[i].jugador1.fichas.length;j++){ 
                          this.fichasTuyas +=  " "  + this.partidas[i].jugador1.fichas[j]  + "  "  ; 
                      }
                       this.visualizarID= id ;   
                       this.errorVisualizar = "" 
                       var boton = <HTMLInputElement> document.getElementById("jugada-boton");
                       var campo = <HTMLInputElement> document.getElementById("campo-jugada");
                       boton.disabled = false;
                       campo.disabled = false;         
                }else{
                  this.visualizarID= id ;  
                  this.errorVisualizar = "" 
                  var boton = <HTMLInputElement> document.getElementById("jugada-boton");
                  var campo = <HTMLInputElement> document.getElementById("campo-jugada");
                  boton.disabled = false;
                  campo.disabled = false;
                  
                  this.fichasTuyas ="" 
                  for(var j = 0; j<this.partidas[i].jugador2.fichas.length;j++){ 
                      this.fichasTuyas +=    " "  +  this.partidas[i].jugador2.fichas[j] + "  "; 
                  }
                }

           }else{ 
             this.errorVisualizar = "No eres un usuario de esta partida";
             var boton = <HTMLInputElement> document.getElementById("jugada-boton");
             var campo = <HTMLInputElement> document.getElementById("campo-jugada");
             boton.disabled = true;
             campo.disabled = true;
             console.log("no tienes autorizacion para ver esta partida");
           }
        }
    }
  }

  //Esta es una funcion que va a recibir la id y elboton de mostrara si el estatus esta en jugando
  //de lo contrario el boton no se mmostrara
  PoderColocarBotonAbandonar(id){
    for(var i=0; i< this.partidas.length;i++)
        if(this.partidas[i].id == id)
           if(this.partidas[i].estatus == "JUGANDO" )  
             return true;

    return false;
  }

  //este lo utilizares cunado queramos abandonar la partida 
  AbandonarPartida(idpartida){
    let body ={ 
                id:idpartida,
                estatus: "FiNALIZO"
              }               
    this.http.put("https://"+ this.jugador.url+"/JugadorAbandonaPartida", body)
    .subscribe( 
        (response: any)=>{
          this.player.status = response.status;
      });
  }

  //Esta es una funcion que va a recibir la id y elboton de mostrara si el estatus esta en espera
  //de lo contrario el boton no se mmostrara
  PoderColocarBotonDeUnir(id){
    for(var i=0; i< this.partidas.length;i++)
        if(this.partidas[i].id == id)
           if(this.partidas[i].estatus == "ESPERA" )  
             return true;
    return false;
  }

  UnirmePartida(idpartida){
    let body ={
          partida:{
            id: idpartida,
            url: this.jugador.url
            //port: this.jugador.port
          }
        }

    this.http.post("https://"+ this.jugador.url +"/unirsepartida", body)
    .subscribe( 
        (response: any)=>{
          this.player.status = response.status;
          this.identificador[idpartida] = 1;
      });
  }

  verificarDesabilitado(id){
       var x = document.getElementsByClassName("grupo-play");
          for (var y = 0; y <= x.length; y--) {
            if(this.identificador[id] == 1){
              return true;
            }
            else{
              return false;
            }
          }
  }

  CrearPartida(){
    this.http.post("https://"+ this.jugador.url +"/crearpartida",{})
    .subscribe( 
        (response: any)=>{
          this.player.status = response.status;
          this.partidas = response.message;
      });
  }

  Jugar(fichaAJugar){
    var boton = <HTMLInputElement> document.getElementById("jugada-boton");
    var campo = <HTMLInputElement> document.getElementById("campo-jugada");
    boton.disabled = true;
    campo.disabled = true;
    
      let body={
            id:this.visualizarID,
            ficha:fichaAJugar,
            ip:this.jugador.url  
          }  
      this.http.post("https://"+ this.jugador.url +"/realizarJugada", body)
      .subscribe( 
        (response: any)=>{
          this.player.status = response.status;
          boton.disabled = false;
          campo.disabled = false;
          campo.value = "";
      });
  }

  //esta funcion es que el tablero una vez que este visualizado se vea automaticamente
  //se actualice pues 
  visualizartablerodeJugada(){
    if (this.visualizarID != -1)
      for(var i=0; i< this.partidas.length;i++)
        if(this.partidas[i].id == this.visualizarID){
                this.fichasTablero = "" 
                for(var j = 0; j<this.partidas[i].fichas_jugadas.length;j++){ 
                      this.fichasTablero +=    " "  +  this.partidas[i].fichas_jugadas[j]+ "  "; 
                }
                if((this.partidas[i].jugador1.ip  == this.jugador.url)){
                    this.fichasTuyas ="" 
                    for(var j = 0; j<this.partidas[i].jugador1.fichas.length;j++){ 
                      this.fichasTuyas +=    " "  +  this.partidas[i].jugador1.fichas[j] + "  "; 
                  }
                }        
                if((this.partidas[i].jugador2.ip  == this.jugador.url)){
                  this.fichasTuyas ="" 
                  for(var j = 0; j<this.partidas[i].jugador2.fichas.length;j++){ 
                      this.fichasTuyas +=    " "  +  this.partidas[i].jugador2.fichas[j] + "  "; 
                  }                 
                }
         }
  }
}
