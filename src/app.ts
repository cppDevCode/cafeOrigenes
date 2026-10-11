import { Servidor } from './core/Servidor.js'

class App {
    public static run () {
        const servidor = new Servidor()
        servidor.startServer()
    }
}

App.run()

