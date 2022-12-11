<?php

require_once("UserService.php");
//require_once("ServerStatusService.php");

class RequestHandler// extends ServerStatus
{
    function Request_Handler($userRequest, $data)
    {
        $uServices = new UserServices();
        switch($userRequest)
        {
            case "GetAllMovies":
                return $response = $uServices -> GetMovies();
                break;
            case "GetLocalImages":
                return $response = $uServices -> GetLocalImages($data);
                break;
            case "GetDriveImages":
                return $response = $uServices -> GetImagesFromDrive($data);
                break;
            default:
                return $response = $uServices -> FaultMethod($data);
                break;
        }
    }

}

?>
