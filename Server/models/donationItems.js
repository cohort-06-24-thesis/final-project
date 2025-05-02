module.exports=(sequelize, DataTypes) => {
    const DonationItem= sequelize.define('DonationItem', {
        title :{
            type: DataTypes.STRING,
            allowNull: false
        },
        description :{
            type: DataTypes.TEXT,
            allowNull: false
        },
        image: {
            type: DataTypes.ARRAY(DataTypes.STRING), // Array of strings
            allowNull: false
        },
        status :{
            type: DataTypes.ENUM('available','reserved','claimed'),
            defaultValue:'available'
        },
        location :{
            type: DataTypes.STRING,
            allowNull: false,

        },
        latitude: {
            type: DataTypes.FLOAT, // Latitude as a float
            allowNull: true, // Optional field
        },
        longitude: {
            type: DataTypes.FLOAT, // Longitude as a float
            allowNull: true, // Optional field
        },
        
    })
    return DonationItem
}