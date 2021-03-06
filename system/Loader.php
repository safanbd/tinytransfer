<?php
namespace system;

class Loader
{
    protected $classes = [];
    protected $instances = [];
    protected static $dirs = [];
    /**
     * Registers a class.
     */
    public function register($name, $class, array $params = [], $callback = null)
    {
        unset($this->instances[$name]);

        $this->classes[$name] = array($class, $params, $callback);
    }
    /**
     * Unregisters a class.
     */
    public function unregister($name)
    {
        unset($this->classes[$name]);
    }
    /**
     * Loads a registered class.
     */
    public function load($name, $shared = true)
    {
        $obj = null;
        if (isset($this->classes[$name])) {
            list($class, $params, $callback) = $this->classes[$name];
            $exists = isset($this->instances[$name]);
            if ($shared) {
                $obj = ($exists) ?
                $this->getInstance($name) :
                $this->newInstance($class, $params);
                if (!$exists) {
                    $this->instances[$name] = $obj;
                }
            } else {
                $obj = $this->newInstance($class, $params);
            }
            if ($callback && (!$shared || !$exists)) {
                $ref = array(&$obj);
                call_user_func_array($callback, $ref);
            }
        }

        return $obj;
    }

    /**
     * Gets a single instance of a class.
     */
    public function getInstance($name)
    {
        return isset($this->instances[$name]) ? $this->instances[$name] : null;
    }

    /**
     * Gets a new instance of a class.
     */
    public function newInstance($class, array $params = [])
    {
        if (is_callable($class)) {
            return call_user_func_array($class, $params);
        }

        switch (count($params)) {
            case 0:
                return new $class();
            case 1:
                return new $class($params[0]);
            case 2:
                return new $class($params[0], $params[1]);
            case 3:
                return new $class($params[0], $params[1], $params[2]);
            case 4:
                return new $class($params[0], $params[1], $params[2], $params[3]);
            case 5:
                return new $class($params[0], $params[1], $params[2], $params[3], $params[4]);
            default:
                try {
                    $refClass = new \ReflectionClass($class);
                    return $refClass->newInstanceArgs($params);
                } catch (\ReflectionException $e) {
                    throw new \Exception("Cannot instantiate {$class}", 0, $e);
                }
        }
    }

    /**
     * @param string $name Registry name
     * @return mixed Class information or null if not registered
     */
    public function get($name)
    {
        return isset($this->classes[$name]) ? $this->classes[$name] : null;
    }

    /**
     * Resets the object to the initial state.
     */
    public function reset()
    {
        $this->classes = [];
        $this->instances = [];
    }

    /**
     * Starts/stops autoloader.
     */
    public static function autoload($enabled = true, $dirs = [])
    {
        if ($enabled) {
            spl_autoload_register(array(__CLASS__, 'loadClass'));
        } else {
            spl_autoload_unregister(array(__CLASS__, 'loadClass'));
        }
        if (!empty($dirs)) {
            self::addDirectory($dirs);
        }
    }
    /**
     * Autoloads classes.
     */
    public static function loadClass($class)
    {
        $class_file = str_replace(array('\\', '_'), '/', $class) . '.php';
        foreach (self::$dirs as $dir) {
            $file = $dir . '/' . $class_file;
            if (file_exists($file)) {
                require $file;
                return;
            }
        }
    }
    /**
     * Adds a directory for autoloading classes.
     */
    public static function addDirectory($dir)
    {
        if (is_array($dir) || is_object($dir)) {
            foreach ($dir as $value) {
                self::addDirectory($value);
            }
        } elseif (is_string($dir)) {
            if (!in_array($dir, self::$dirs)) {
                self::$dirs[] = $dir;
            }
        }
    }
}
