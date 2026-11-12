import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Zona } from "../../zonas/entities/zona.entity";

@Entity({
    name: "cultivos",
})
export class Cultivo {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100, unique: true })
    nombre: string;

    @Column({ type: "text", nullable: true })
    descripcion: string | null;

    @CreateDateColumn(
        {
            type: "timestamptz",
            default: () => "CURRENT_TIMESTAMP",
            name: "created_at"
        })
    createdAt: Date;

    @UpdateDateColumn(
        {
            type: "timestamptz",
            default: () => "CURRENT_TIMESTAMP",
            name: "updated_at"
        })
    updatedAt: Date;

    @ManyToMany(() => Zona, (zona) => zona.cultivos)
    zonas: Zona[];
}
