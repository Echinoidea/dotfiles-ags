
#!/bin/bash

# Display the options
echo "What would you like to do?"
echo "1) Shutdown"
echo "2) Reboot"
echo "3) Suspend"

# Read user input
read -p "Enter the number of your choice: " choice

# Handle the user choice with systemctl commands
case $choice in
    1)
        echo "Shutting down..."
        systemctl poweroff
        ;;
    2)
        echo "Rebooting..."
        systemctl reboot
        ;;
    3)
        echo "Suspending..."
        systemctl suspend
        ;;
    *)
        echo "Invalid option. Exiting."
        ;;
esac
