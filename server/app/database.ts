import mongoose from 'mongoose';

export class Database {
    static readonly mongoURL = 'mongodb+srv://admin:admin@cluster0.t7qhslz.mongodb.net/?retryWrites=true&w=majority';

    static async connect(): Promise<void> {
        mongoose.Promise = global.Promise;
        return (
            mongoose
                .connect(this.mongoURL)
                // Afficher le statut de connexion à MongoDB pour confirmer que la connexion à la base de données s'établit correctement.
                // eslint-disable-next-line no-console
                .then(() => console.log('MongoDB connected'))
        );
    }
}
